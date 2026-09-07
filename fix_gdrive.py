import re

with open('src/lib/googleWorkspace.ts', 'r') as f:
    content = f.read()

new_upload_logic = """    const metadata = {
      name: fileName,
      mimeType: mimeType,
    };

    const boundary = "-------314159265358979323846";
    const delimiter = "\\r\\n--" + boundary + "\\r\\n";
    const close_delim = "\\r\\n--" + boundary + "--";

    const bodyPrefix =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\\r\\n\\r\\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: " + mimeType + "\\r\\n\\r\\n";

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
    }"""

# regex to replace from 'const metadata =' to '} else {\n      throw new Error("Failed to get webViewLink");\n    }'
pattern = re.compile(r'const metadata = \{[\s\S]*?throw new Error\("Failed to get webViewLink"\);\s*\}', re.MULTILINE)

content = pattern.sub(new_upload_logic, content)

with open('src/lib/googleWorkspace.ts', 'w') as f:
    f.write(content)
print("Fixed GDrive upload logic!")
