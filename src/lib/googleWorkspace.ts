import { auth, googleProvider } from "./firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const openInGoogleWorkspace = async (
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string
) => {
  let newTab: Window | null = null;
  try {
    // Open the window IMMEDIATELY to bypass popup blockers
    newTab = window.open("about:blank", "_blank");
    if (newTab) {
      newTab.document.write(
        '<html><body><h2 style="font-family:sans-serif; padding:20px;">Authenticating and uploading to Google Drive... Please wait.</h2></body></html>'
      );
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");
    const result = await signInWithPopup(auth, provider);
    
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) throw new Error("Could not get Google access token");

    if (newTab) {
      newTab.document.body.innerHTML = '<h2 style="font-family:sans-serif; padding:20px;">Uploading to Google Drive... Please wait.</h2>';
    }

    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const bodyPrefix =
      "--" + boundary + "\r\n" +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: " + mimeType + "\r\n\r\n";

    const blob = new Blob([bodyPrefix, fileBuffer, close_delim], {
      type: "multipart/related; boundary=" + boundary,
    });

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/related; boundary=" + boundary,
        },
        body: blob,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Drive API Error Details:", data);
      throw new Error(data.error?.message || "Failed to upload to Google Workspace");
    }

    if (data.webViewLink) {
      if (newTab) {
        newTab.location.href = data.webViewLink;
      } else {
        window.open(data.webViewLink, "_blank");
      }
      return true;
    } else {
      throw new Error("Failed to get webViewLink from Google Drive");
    }
  } catch (error) {
    console.error("Google Workspace Error:", error);
    if (newTab) {
      newTab.close();
    }
    throw error;
  }
};
