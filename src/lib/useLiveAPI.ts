import { useState, useRef, useCallback } from 'react';

export function useLiveAPI() {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startLive = useCallback(async () => {
    try {
      setIsConnecting(true);
      const host = window.location.host;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${host}/live`);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnecting(false);
        setIsRecording(true);

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;
        
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const channelData = e.inputBuffer.getChannelData(0);
            
            // Convert Float32Array to 16-bit PCM little-endian
            const buffer = new ArrayBuffer(channelData.length * 2);
            const view = new DataView(buffer);
            for (let i = 0; i < channelData.length; i++) {
              let s = Math.max(-1, Math.min(1, channelData[i]));
              view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }
            
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            ws.send(JSON.stringify({ audio: base64 }));
          }
        };
      };

      let nextStartTime = 0;
      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio) {
           const outputCtx = outputAudioCtxRef.current;
           if (!outputCtx) return;

           const binaryString = atob(msg.audio);
           const len = binaryString.length;
           const bytes = new Uint8Array(len);
           for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
           }
           const int16Array = new Int16Array(bytes.buffer);
           const float32Array = new Float32Array(int16Array.length);
           for (let i = 0; i < int16Array.length; i++) {
              float32Array[i] = int16Array[i] / 0x8000;
           }

           const audioBuffer = outputCtx.createBuffer(1, float32Array.length, 24000);
           audioBuffer.getChannelData(0).set(float32Array);

           const source = outputCtx.createBufferSource();
           source.buffer = audioBuffer;
           source.connect(outputCtx.destination);

           if (nextStartTime < outputCtx.currentTime) {
             nextStartTime = outputCtx.currentTime;
           }
           source.start(nextStartTime);
           nextStartTime += audioBuffer.duration;
        }
        if (msg.interrupted) {
           nextStartTime = 0;
        }
      };

      ws.onclose = () => {
        stopLive();
      };
      
    } catch (e) {
      console.error('Failed to start Live API:', e);
      setIsConnecting(false);
      setIsRecording(false);
    }
  }, []);

  const stopLive = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsRecording(false);
    setIsConnecting(false);
  }, []);

  return { startLive, stopLive, isRecording, isConnecting };
}
