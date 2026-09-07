export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "manager" | "user";
  storageUsed: number;
  storageLimit: number;
  plan?: string;
};
export type FileItem = {
  isUploading?: boolean;
  uploadProgress?: number;
  ownerName?: string;
  id: string;
  name: string;
  type: string;
  size?: number | string;
  updatedAt: string;
  createdAt?: string;
  ownerId: string;
  owner?: string;
  parentId: string | null;
  sharedWith?: string[];
  shared?: string[];
  starred?: boolean;
  color?: string;
  /* for folders */ url?: string;
  content?: string;
  tags?: string[];
  isDeleted?: boolean;
  deletedAt?: string | number;
};
export const currentUser: User = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex.j@docflow.com",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  role: "admin",
  storageUsed: 15 * 1024 * 1024 * 1024,
  /* 15GB */ storageLimit: 100 * 1024 * 1024 * 1024 /* 100GB */,
};
export const mockUsers: User[] = [
  currentUser,
  {
    id: "u2",
    name: "Sarah Miller",
    email: "sarah.m@docflow.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704c",
    role: "manager",
    storageUsed: 5 * 1024 * 1024 * 1024,
    storageLimit: 50 * 1024 * 1024 * 1024,
  },
  {
    id: "u3",
    name: "Michael Chen",
    email: "m.chen@docflow.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704b",
    role: "user",
    storageUsed: 1.2 * 1024 * 1024 * 1024,
    storageLimit: 15 * 1024 * 1024 * 1024,
  },
  {
    id: "u4",
    name: "Emily Davis",
    email: "emily.d@docflow.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704a",
    role: "user",
    storageUsed: 8 * 1024 * 1024 * 1024,
    storageLimit: 15 * 1024 * 1024 * 1024,
  },
  {
    id: "u5",
    name: "David Wilson",
    email: "david.w@docflow.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e290267049",
    role: "user",
    storageUsed: 12 * 1024 * 1024 * 1024,
    storageLimit: 15 * 1024 * 1024 * 1024,
  },
];
export const mockFiles: FileItem[] = [];
export const mockActivity: any[] = [];
