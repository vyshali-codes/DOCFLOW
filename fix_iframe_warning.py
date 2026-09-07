import re

with open('src/components/FilePreviewModal.tsx', 'r') as f:
    content = f.read()

new_btn = """                  try {
                    // Check if running in iframe (AI Studio preview)
                    if (window.self !== window.top) {
                      toast.warning("Warning: You are in a preview frame. If the Google Auth popup hangs, please open the app in a New Tab.", { autoClose: 6000 });
                    }
                    toast.info("Opening in Google Workspace...");
                    await openInGoogleWorkspace(buffer, file.name, mime);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to open. Ensure popups are allowed.");
                  }"""

content = re.sub(
    r'try \{\s*toast\.info\("Opening in Google Workspace\.\.\."\);\s*await openInGoogleWorkspace\(buffer, file\.name, mime\);\s*\} catch \(err\) \{\s*toast\.error\("Failed to open\. Ensure popups are allowed\."\);\s*\}',
    new_btn,
    content
)

with open('src/components/FilePreviewModal.tsx', 'w') as f:
    f.write(content)
print("Added iframe warning!")
