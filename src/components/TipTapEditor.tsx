import React, {
 useEffect, useState 
}
 from "react";
 import {
 useEditor, EditorContent 
}
 from "@tiptap/react";
 import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
 import Collaboration from "@tiptap/extension-collaboration";
 import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
 import {
 TextStyle 
}
 from "@tiptap/extension-text-style";
 import {
 Color 
}
 from "@tiptap/extension-color";
 import {
 Underline 
}
 from "@tiptap/extension-underline";
 import {
 Link 
}
 from "@tiptap/extension-link";
 import {
 Image 
}
 from "@tiptap/extension-image";
 import {
 Table 
}
 from "@tiptap/extension-table";
 import {
 TableRow 
}
 from "@tiptap/extension-table-row";
 import {
 TableCell 
}
 from "@tiptap/extension-table-cell";
 import {
 TableHeader 
}
 from "@tiptap/extension-table-header";
 import {
 TaskList 
}
 from "@tiptap/extension-task-list";
 import {
 TaskItem 
}
 from "@tiptap/extension-task-item";
 import {
 FontFamily 
}
 from "@tiptap/extension-font-family";
 import {
 HocuspocusProvider 
}
 from "@hocuspocus/provider";
 import * as Y from "yjs";
 import {
 Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Type, Heading1, Heading2, Table as TableIcon, Save, Check, 
}
 from "lucide-react";
 import {
 fileService 
}
 from "../lib/fileService";
 import {
 toast 
}
 from "react-toastify";
 const colors = [ "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff", "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff", ];
 const fonts = [ "Arial", "Courier New", "Georgia", "Times New Roman", "Trebuchet MS", "Verdana", ];
 export function TipTapEditor({
  documentId, initialContent, currentUser, onSaveStatusChange, readOnly, onUpdateTOC
}: {
  documentId: string;
  initialContent: string;
  currentUser: any;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved") => void;
  readOnly?: boolean;
  onUpdateTOC?: (toc: any[]) => void;
}) {
 const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
 useEffect(() => {
 /* Determine WS URL */ const isSecure = window.location.protocol === "https:";
 const wsProtocol = isSecure ? "wss:" : "ws:";
 const wsUrl = `${
 wsProtocol 
}
 //${
 window.location.host 
}
 /collaboration`;
 const newProvider = new HocuspocusProvider({
 url: wsUrl, name: documentId, onConnect: () => console.log("Connected to Hocuspocus"), 
}
 );
 setProvider(newProvider);
 return () => {
 newProvider.destroy();
 
}
 ;
 
}
 , [documentId]);
 if (!provider) return ( <div className="p-8 text-center text-slate-500"> Connecting to collaboration server... </div> );
 return ( <EditorWithProvider provider={
 provider 
}
 initialContent={
 initialContent 
}
 currentUser={
 currentUser 
}
 onSaveStatusChange={onSaveStatusChange}
        documentId={
 documentId 
}
 /> );
 
}
 function EditorWithProvider({
 provider, initialContent, currentUser, documentId, onSaveStatusChange, readOnly, onUpdateTOC 
}
 : {
 provider: HocuspocusProvider;
 initialContent: string;
 currentUser: any;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved") => void;
 documentId: string;
  readOnly?: boolean;
  onUpdateTOC?: (toc: any[]) => void;
}
 ) {
 const [activeUsers, setActiveUsers] = useState<any[]>([]);
 useEffect(() => {
 const updateAwareness = () => {
 const states = Array.from(provider.awareness.getStates().values());
 const users = states.map((state: any) => state.user).filter(Boolean);
 /* Remove duplicates by name */ const uniqueUsers = Array.from( new Map(users.map((u) => [u.name, u])).values() );
 setActiveUsers(uniqueUsers);
 
}
 ;
 provider.awareness.on("change", updateAwareness);
 updateAwareness();
 /* initial call */ return () => {
 provider.awareness.off("change", updateAwareness);
 
}
 ;
 
}
 , [provider.awareness]);
 const editor = useEditor({
 extensions: [ StarterKit.configure({
 // @ts-ignore history: false, // @ts-ignore /* Collaborative history handled by Yjs */ 
}
 ), Collaboration.configure({
 document: provider.document, 
}
 ), CollaborationCursor.configure({
 provider, user: {
 name: currentUser.name, color: "#" + Math.floor(Math.random() * 16777215).toString(16), 
}
 , 
}
 ), TextStyle, Color, Underline, Link.configure({
 openOnClick: false 
}
 ), Image, Table.configure({
 resizable: true 
}
 ), TableRow, TableHeader, TableCell, TaskList, TaskItem, FontFamily, CharacterCount, ],
 editable: !readOnly,
 onUpdate: ({
 editor 
}
 ) => {
 /* We can occasionally save the HTML to Firestore fo */ /* Debounce saving */ const html = editor.getHTML();
 /* fileService.updateDocument(documentId, {
 content: html } ); */ 
}
 , 
}
 );
 useEffect(() => {
 /* When connected, check if document is empty. If so, initialize it. */ provider.on("synced", () => {
 if (editor && editor.isEmpty && initialContent) {
 editor.commands.setContent(initialContent);
 
}
 
}
 );
 
}
 , [provider, editor, initialContent]);
  /* Handle saving to firestore debounced or interval */
  useEffect(() => {
    if (!editor) return;

    let timeout: any;
    let finishTimeout: any;
    let interval: any;
    let pendingChanges = false;

    const performSave = () => {
      if (!pendingChanges) return;
      
      const html = editor.getHTML();
      fileService.updateDocument(documentId, { content: html }, false)
        .then(() => {
          onSaveStatusChange?.("saved");
          pendingChanges = false;
          clearTimeout(finishTimeout);
          finishTimeout = setTimeout(() => onSaveStatusChange?.("idle"), 3000);
        })
        .catch((err) => {
           console.error(err);
           onSaveStatusChange?.("idle");
        });
    };

    const handleUpdate = () => {
      onSaveStatusChange?.("saving");
      pendingChanges = true;
      clearTimeout(timeout);
      
      // Save on 5 seconds of inactivity
      timeout = setTimeout(() => {
        performSave();
      }, 5000);
    };

    editor.on("update", handleUpdate);
    
    // Also save every 30 seconds if there are pending changes
    interval = setInterval(() => {
      performSave();
    }, 30000);

    return () => {
      editor.off("update", handleUpdate);
      clearTimeout(timeout);
      clearTimeout(finishTimeout);
      clearInterval(interval);
    };
  }, [editor, documentId, onSaveStatusChange]);
 const handleSaveVersion = async () => {
 if (!editor) return;
 try {
 const html = editor.getHTML();
 const text = editor.getText();
 await fileService.createVersion(documentId, html);
 await fileService.updateDocument(documentId, {
 content: text 
}
 , false);
 toast.success("Version saved to history!");
 
}
 catch (err) {
 toast.error("Failed to save version");
 
}
 
}
 ;
 if (!editor) return null;
 return ( <div className="flex flex-col h-full bg-slate-100 shadow-sm border border-slate-200 overflow-hidden"> {
 /* Ribbon Tabs */ 
}
 <div className="flex bg-[#2b579a] text-white pt-2 px-2 gap-1 text-sm select-none"> <div className="px-4 py-1.5 bg-[#f3f2f1] text-[#2b579a] font-semibold rounded-t-sm"> Home </div> <div className="px-4 py-1.5 hover:bg-white/10 cursor-pointer rounded-t-sm transition-colors"> Insert </div> <div className="px-4 py-1.5 hover:bg-white/10 cursor-pointer rounded-t-sm transition-colors"> Layout </div> <div className="px-4 py-1.5 hover:bg-white/10 cursor-pointer rounded-t-sm transition-colors"> Review </div> </div> {
 /* Ribbon Toolbar */ 
}
 <div className="flex flex-wrap items-center gap-4 p-2 bg-[#f3f2f1] border-b border-slate-300 shadow-sm z-10"> {
 /* Font Group */ 
}
 <div className="flex flex-col gap-1 border-r border-slate-300 pr-4"> <div className="flex items-center gap-1"> <select className="text-sm border border-slate-300 rounded px-2 py-1 bg-white hover:border-blue-400 focus:border-blue-500 outline-none w-32" onChange={
 (e) => editor.chain().focus().setFontFamily(e.target.value).run() 
}
 value={
 editor.getAttributes("textStyle").fontFamily || "" 
}
 > <option value="">Default Font</option> {
 fonts.map((font) => ( <option key={
 font 
}
 value={
 font 
}
 > {
 font 
}
 </option> )) 
}
 </select> </div> <div className="flex items-center gap-0.5"> <button onClick={
 () => editor.chain().focus().toggleBold().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("bold") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 title="Bold" > <Bold className="w-4 h-4" /> </button> <button onClick={
 () => editor.chain().focus().toggleItalic().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("italic") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 title="Italic" > <Italic className="w-4 h-4" /> </button> <button onClick={
 () => editor.chain().focus().toggleUnderline().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("underline") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 title="Underline" > <UnderlineIcon className="w-4 h-4" /> </button> <button onClick={
 () => editor.chain().focus().toggleStrike().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("strike") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 title="Strikethrough" > <Strikethrough className="w-4 h-4" /> </button> <button onClick={
 () => editor.chain().focus().toggleCode().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("code") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 title="Code" > <Code className="w-4 h-4" /> </button> <div className="w-px h-4 bg-slate-300 mx-1"></div> <input type="color" onInput={
 (event) => editor .chain() .focus() .setColor((event.target as HTMLInputElement).value) .run() 
}
 value={
 editor.getAttributes("textStyle").color || "#000000" 
}
 className="w-5 h-5 p-0 border-0 rounded cursor-pointer" title="Font Color" /> </div> <div className="text-[10px] text-slate-500 text-center font-medium mt-0.5"> Font </div> </div> {
 /* Paragraph Group */ 
}
 <div className="flex flex-col gap-1 border-r border-slate-300 pr-4"> <div className="flex items-center gap-1 h-[26px]"> <button onClick={
 () => editor.chain().focus().toggleHeading({
 level: 1 
}
 ).run() 
}
 className={
 `px-2 py-0.5 text-xs font-bold rounded ${
 editor.isActive("heading", {
 level: 1 
}
 ) ? "bg-slate-300" : "hover:bg-slate-200" 
}
 ` 
}
 > H1 </button> <button onClick={
 () => editor.chain().focus().toggleHeading({
 level: 2 
}
 ).run() 
}
 className={
 `px-2 py-0.5 text-xs font-bold rounded ${
 editor.isActive("heading", {
 level: 2 
}
 ) ? "bg-slate-300" : "hover:bg-slate-200" 
}
 ` 
}
 > H2 </button> <button onClick={
 () => editor.chain().focus().setParagraph().run() 
}
 className={
 `px-2 py-0.5 text-xs rounded ${
 editor.isActive("paragraph") ? "bg-slate-300" : "hover:bg-slate-200" 
}
 ` 
}
 > P </button> </div> <div className="flex items-center gap-0.5"> <button onClick={
 () => editor.chain().focus().toggleBulletList().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("bulletList") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 > <List className="w-4 h-4" /> </button> <button onClick={
 () => editor.chain().focus().toggleOrderedList().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("orderedList") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 > <ListOrdered className="w-4 h-4" /> </button> <button onClick={
 () => editor.chain().focus().toggleTaskList().run() 
}
 className={
 `p-1 rounded ${
 editor.isActive("taskList") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 > <Check className="w-4 h-4" /> </button> </div> <div className="text-[10px] text-slate-500 text-center font-medium mt-0.5"> Paragraph </div> </div> {
 /* Insert Group */ 
}
 <div className="flex flex-col gap-1 pr-4"> <div className="flex items-center gap-1 h-full"> <button onClick={
 () => {
 const url = window.prompt("URL");
 if (url) editor.chain().focus().setLink({
 href: url 
}
 ).run();
 
}
 
}
 className={
 `p-2 rounded flex flex-col items-center gap-1 ${
 editor.isActive("link") ? "bg-slate-300 shadow-inner" : "hover:bg-slate-200" 
}
 ` 
}
 > <LinkIcon className="w-5 h-5 text-blue-600" /> </button> <button onClick={
 () => {
 const url = window.prompt("Image URL");
 if (url) editor.chain().focus().setImage({
 src: url 
}
 ).run();
 
}
 
}
 className="p-2 rounded flex flex-col items-center gap-1 hover:bg-slate-200" > <ImageIcon className="w-5 h-5 text-green-600" /> </button> <button onClick={
 () => editor .chain() .focus() .insertTable({
 rows: 3, cols: 3, withHeaderRow: true 
}
 ) .run() 
}
 className="p-2 rounded flex flex-col items-center gap-1 hover:bg-slate-200" > <TableIcon className="w-5 h-5 text-orange-600" /> </button> </div> <div className="text-[10px] text-slate-500 text-center font-medium mt-0.5"> Insert </div> </div> <div className="ml-auto flex items-center gap-3 px-2"> <button onClick={
 handleSaveVersion 
}
 className="flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 rounded-sm border border-blue-300 shadow-sm" title="Save as a new version in history" > <Save className="w-3.5 h-3.5" /> Save </button> <div className="flex items-center gap-1.5"> {
 activeUsers.map((u, i) => ( <div key={
 i 
}
 className="flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shadow-sm" style={
 {
 backgroundColor: u.color 
}
 
}
 title={
 u.name 
}
 > {
 u.name.charAt(0).toUpperCase() 
}
 </div> )) 
}
 </div> </div> </div> <div className="flex-1 overflow-auto p-4 cursor-text bg-white" onClick={
 () => editor.chain().focus().run() 
}
 > <style dangerouslySetInnerHTML={
 {
 __html: ` .ProseMirror {
 outline: none;
 min-height: 100%;
 
}
 .ProseMirror p.is-editor-empty:first-child::before {
 content: attr(data-placeholder);
 float: left;
 color: #adb5bd;
 pointer-events: none;
 height: 0;
 
}
 .ProseMirror table {
 border-collapse: collapse;
 table-layout: fixed;
 width: 100%;
 margin: 0;
 overflow: hidden;
 
}
 .ProseMirror table td, .ProseMirror table th {
 min-width: 1em;
 border: 2px solid #ced4da;
 padding: 3px 5px;
 vertical-align: top;
 box-sizing: border-box;
 position: relative;
 
}
 .ProseMirror table th {
 font-weight: bold;
 text-align: left;
 background-color: #f1f3f5;
 
}
 /* Collaborative cursors */ .collaboration-cursor__caret {
 border-left: 2px solid #0d0d0d;
 border-right: 2px solid #0d0d0d;
 margin-left: -2px;
 margin-right: -2px;
 pointer-events: none;
 position: relative;
 word-break: normal;
 
}
 .collaboration-cursor__label {
 border-radius: 3px 3px 3px 0;
 color: #fff;
 font-size: 12px;
 font-style: normal;
 font-weight: 600;
 left: -1px;
 line-height: normal;
 padding: 0.1rem 0.3rem;
 position: absolute;
 top: -1.4em;
 user-select: none;
 white-space: nowrap;
 
}
 `, 
}
 
}
 /> <EditorContent editor={
 editor 
}
 className="prose max-w-none" /> </div> </div> );
 
}
 