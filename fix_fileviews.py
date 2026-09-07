import re

with open('src/components/FileViews.tsx', 'r') as f:
    content = f.read()

# Add activeMenu back to FileGrid
content = content.replace(
    'const [dragOverId, setDragOverId] = React.useState<string | null>(null);',
    'const [activeMenu, setActiveMenu] = React.useState<string | null>(null);\n  const [dragOverId, setDragOverId] = React.useState<string | null>(null);'
)

with open('src/components/FileViews.tsx', 'w') as f:
    f.write(content)
print("Fixed FileViews.tsx!")
