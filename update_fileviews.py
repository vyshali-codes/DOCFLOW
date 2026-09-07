import re

with open('src/components/FileViews.tsx', 'r') as f:
    content = f.read()

# Make grid items focusable and handle keyboard events
new_grid = """export function FileGrid({
  files,
  onFileClick,
  onFileDoubleClick,
  selectedFileId,
  onMoveFile,
}: {
  files: FileItem[];
  onFileClick: (id: string, type: string) => void;
  onFileDoubleClick?: (id: string, type: string) => void;
  selectedFileId?: string | null;
  onMoveFile?: (fileId: string, folderId: string | null) => void;
}) {
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, file: FileItem, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onFileDoubleClick) onFileDoubleClick(file.id, file.type);
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onFileClick(file.id, file.type);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextEl = document.getElementById(`grid-item-${index + 1}`);
      if (nextEl) (nextEl as HTMLElement).focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevEl = document.getElementById(`grid-item-${index - 1}`);
      if (prevEl) (prevEl as HTMLElement).focus();
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const handleDragOver = (e: React.DragEvent, file: FileItem) => {
    if (file.type === "folder") {
      e.preventDefault();
      setDragOverId(file.id);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };
  const handleDrop = (e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    setDragOverId(null);
    if (targetFolder.type === "folder" && onMoveFile) {
      const sourceId = e.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== targetFolder.id) {
        onMoveFile(sourceId, targetFolder.id);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 outline-none">
      {" "}
      {files.map((file, index) => (
        <div
          key={file.id}
          id={`grid-item-${index}`}
          tabIndex={0}
          role="button"
          aria-pressed={selectedFileId === file.id}
          onKeyDown={(e) => handleKeyDown(e, file, index)}
          draggable
          onDragStart={(e) => handleDragStart(e, file.id)}
          onDragOver={(e) => handleDragOver(e, file)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, file)}
          onClick={(e) => {
            e.stopPropagation();
            onFileClick(file.id, file.type);
          }}
          className={cn("""

content = re.sub(
    r'export function FileGrid\(\{[\s\S]*?className=\{cn\(', 
    new_grid, 
    content
)

# Do the same for FileList
new_list = """export function FileList({
  files,
  onFileClick,
  onFileDoubleClick,
  selectedFileId,
  onMoveFile,
}: {
  files: FileItem[];
  onFileClick: (id: string, type: string) => void;
  onFileDoubleClick?: (id: string, type: string) => void;
  selectedFileId?: string | null;
  onMoveFile?: (fileId: string, folderId: string | null) => void;
}) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, file: FileItem, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onFileDoubleClick) onFileDoubleClick(file.id, file.type);
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onFileClick(file.id, file.type);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextEl = document.getElementById(`list-item-${index + 1}`);
      if (nextEl) (nextEl as HTMLElement).focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevEl = document.getElementById(`list-item-${index - 1}`);
      if (prevEl) (prevEl as HTMLElement).focus();
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const handleDragOver = (e: React.DragEvent, file: FileItem) => {
    if (file.type === "folder") {
      e.preventDefault();
      setDragOverId(file.id);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };
  const handleDrop = (e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    setDragOverId(null);
    if (targetFolder.type === "folder" && onMoveFile) {
      const sourceId = e.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== targetFolder.id) {
        onMoveFile(sourceId, targetFolder.id);
      }
    }
  };
  return (
    <div className="bg-theme-card rounded-xl border border-theme-border flex-1 flex flex-col overflow-hidden">
      {" "}
      <div className="grid grid-cols-12 border-b border-theme-border bg-theme-bg px-6 py-3 text-[11px] font-bold text-theme-muted dark:text-theme-muted uppercase tracking-wider">
        {" "}
        <div className="col-span-6">Name</div>{" "}
        <div className="col-span-2 text-center hidden sm:block">Owner</div>{" "}
        <div className="col-span-2 text-center hidden md:block">Modified</div>{" "}
        <div className="col-span-2 text-right hidden lg:block">Size</div>{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 outline-none" role="list">
        {" "}
        {files.map((file, index) => (
          <div
            key={file.id}
            id={`list-item-${index}`}
            tabIndex={0}
            role="listitem"
            aria-selected={selectedFileId === file.id}
            onKeyDown={(e) => handleKeyDown(e, file, index)}
            draggable
            onDragStart={(e) => handleDragStart(e, file.id)}
            onDragOver={(e) => handleDragOver(e, file)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, file)}
            onClick={(e) => {
              e.stopPropagation();
              onFileClick(file.id, file.type);
            }}
            className={cn("""

content = re.sub(
    r'export function FileList\(\{[\s\S]*?className=\{cn\(', 
    new_list, 
    content
)

# And make sure focus states are visible in the tailwind cn(...) classes
# For grid:
content = content.replace(
    '"group flex items-center gap-3 p-3 bg-theme-card border border-theme-border rounded-lg transition-all cursor-pointer relative select-none"',
    '"group flex items-center gap-3 p-3 bg-theme-card border border-theme-border rounded-lg transition-all cursor-pointer relative select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"'
)

# For list:
content = content.replace(
    '"grid grid-cols-1 lg:grid-cols-12 px-6 py-3 text-sm items-center transition-colors group cursor-pointer relative select-none"',
    '"grid grid-cols-1 lg:grid-cols-12 px-6 py-3 text-sm items-center transition-colors group cursor-pointer relative select-none focus:outline-none focus:bg-blue-50/40"'
)

with open('src/components/FileViews.tsx', 'w') as f:
    f.write(content)
print("Updated FileViews.tsx!")
