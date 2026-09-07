import re

with open('src/components/FileViews.tsx', 'r') as f:
    content = f.read()

# Only replace the duplicate activeMenu in FileList if it exists
def remove_duplicate(match):
    text = match.group(0)
    # We want to keep only one activeMenu in FileList, or just clean it up if it has multiple
    # It's easier to just do a strict replace where we look for the exact duplicate lines
    return text

# Actually, let's just find and remove the extra ones.
content = content.replace("  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);\n  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);", "  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);")
content = content.replace("  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);\n  const [dragOverId, setDragOverId] = React.useState<string | null>(null);\n  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);", "  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);\n  const [dragOverId, setDragOverId] = React.useState<string | null>(null);")

with open('src/components/FileViews.tsx', 'w') as f:
    f.write(content)
