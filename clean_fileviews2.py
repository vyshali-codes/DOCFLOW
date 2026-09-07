import re

with open('src/components/FileViews.tsx', 'r') as f:
    content = f.read()

# Lines 561 and 562 have duplicates.
# Let's use a regex to replace two activeMenu states with just one in FileList.
content = re.sub(
    r'  const \[activeMenu, setActiveMenu\] = React\.useState<string \| null>\(null\);\n  const \[activeMenu, setActiveMenu\] = React\.useState<string \| null>\(null\);',
    r'  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);',
    content
)

with open('src/components/FileViews.tsx', 'w') as f:
    f.write(content)
print("Cleaned activeMenu duplicates!")
