import React, {
 createContext, useContext, useState, ReactNode, useEffect, useCallback 
}
 from 'react';
 import {
 User, FileItem 
}
 from './mockData';
 import {
 auth, db 
}
 from './firebase';
 import {
 onAuthStateChanged 
}
 from 'firebase/auth';
 import {
 doc, onSnapshot, setDoc 
}
 from 'firebase/firestore';
 import {
 fileService 
}
 from './fileService';
 import {
 toast 
}
 from 'react-toastify';
 type ViewMode = 'grid' | 'list';
 type Theme = 'light' | 'dark' | 'system';
 export type UploadItem = {
 id: string;
 /* Document ID */ file: File;
 name: string;
 progress: number;
 status: 'uploading' | 'paused' | 'error' | 'success' | 'canceled';
 task: any;
 finalizeUpload: () => Promise<void>;
 parentId: string | null;
 
}
 ;
 interface AppContextType {
 user: User | null;
 setUser: (user: User | null) => void;
 files: FileItem[];
 setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
 currentFolderId: string | null;
 setCurrentFolderId: (id: string | null) => void;
 selectedFileId: string | null;
 setSelectedFileId: (id: string | null) => void;
 viewMode: ViewMode;
 setViewMode: (mode: ViewMode) => void;
 theme: Theme;
 setTheme: (theme: Theme) => void;
 searchQuery: string;
 setSearchQuery: (query: string) => void;
 advancedFilters: {
 type: string;
 owner: string;
 dateFrom: string;
 dateTo: string;
 tags: string;
 
}
 ;
 setAdvancedFilters: React.Dispatch<React.SetStateAction<{
 type: string;
 owner: string;
 dateFrom: string;
 dateTo: string;
 tags: string;
 
}
 >>;
 isSidebarOpen: boolean;
 setIsSidebarOpen: (isOpen: boolean) => void;
 logout: () => void;
 isLoadingFiles: boolean;
 authLoading: boolean;
 uploads: UploadItem[];
 addUploads: (files: File[], parentId: string | null, existingDocId?: string) => void;
 cancelUpload: (id: string) => void;
 retryUpload: (id: string) => void;
 removeUpload: (id: string) => void;
 
}
 const AppContext = createContext<AppContextType | undefined>(undefined);
 export function AppProvider({
 children 
}
 : {
 children: ReactNode 
}
 ) {
 const [user, setUser] = useState<User | null>(null);
 const [files, setFiles] = useState<FileItem[]>([]);
 const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
 const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
 const [viewMode, setViewMode] = useState<ViewMode>('grid');
 const [theme, setTheme] = useState<Theme>(() => {
 return (localStorage.getItem('theme') as Theme) || 'light';
 
}
 );
 useEffect(() => {
 localStorage.setItem('theme', theme);
 if (theme === 'dark') {
 document.documentElement.classList.add('dark');
 
}
 else {
 document.documentElement.classList.remove('dark');
 
}
 
}
 , [theme]);
 const [searchQuery, setSearchQuery] = useState('');
 const [advancedFilters, setAdvancedFilters] = useState({
 type: 'all', owner: 'all', dateFrom: '', dateTo: '', tags: '' 
}
 );
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [isLoadingFiles, setIsLoadingFiles] = useState(true);
 const [authLoading, setAuthLoading] = useState(true);
 const [uploads, setUploads] = useState<UploadItem[]>([]);
 const addUploads = useCallback((filesToUpload: File[], parentId: string | null, existingDocId?: string) => {
 filesToUpload.forEach(file => {
 try {
 const {
 uploadTask, finalizeUpload, docId 
}
 = fileService.startUpload(file, parentId, existingDocId);
 const newUpload: UploadItem = {
 id: docId, file, name: file.name, progress: 0, status: 'uploading', task: uploadTask, finalizeUpload, parentId 
}
 ;
 setUploads(prev => [newUpload, ...prev]);
 uploadTask.on('state_changed', (snapshot) => {
 const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
 setUploads(prev => prev.map(u => u.id === docId ? {
 ...u, progress, status: 'uploading' 
}
 : u ));
 
}
 , (error: any) => {
 console.error('Upload error', error);
 toast.error(error.message || `Failed to upload ${
 file.name 
}
 `);
 setUploads(prev => prev.map(u => u.id === docId ? {
 ...u, status: 'error' 
}
 : u ));
 
}
 , async () => {
 try {
 await finalizeUpload();
 toast.success(`Successfully uploaded ${
 file.name 
}
 `);
 setUploads(prev => prev.map(u => u.id === docId ? {
 ...u, progress: 100, status: 'success' 
}
 : u ));
 /* Optionally remove after a delay */ setTimeout(() => {
 setUploads(prev => prev.filter(u => u.id !== docId));
 
}
 , 5000);
 
}
 catch (err: any) {
 console.error('Finalize upload error', err);
 toast.error(`Failed to finalize upload for ${
 file.name 
}
 `);
 setUploads(prev => prev.map(u => u.id === docId ? {
 ...u, status: 'error' 
}
 : u ));
 
}
 
}
 );
 
}
 catch (err: any) {
 console.error("Failed to start upload", err);
 toast.error(`Could not start upload: ${
 err.message || 'Unknown error' 
}
 `);
 
}
 
}
 );
 
}
 , []);
 const cancelUpload = useCallback((id: string) => {
 setUploads(prev => {
 const upload = prev.find(u => u.id === id);
 if (upload && upload.status === 'uploading') {
 upload.task.cancel();
 return prev.map(u => u.id === id ? {
 ...u, status: 'canceled' 
}
 : u);
 
}
 return prev;
 
}
 );
 
}
 , []);
 const retryUpload = useCallback((id: string) => {
 setUploads(prev => {
 const upload = prev.find(u => u.id === id);
 if (upload && (upload.status === 'error' || upload.status === 'canceled')) {
 /* We can't restart a canceled task easily, so we re */ setTimeout(() => {
 addUploads([upload.file], null);
 /* Note: we'd need to track parentId, but for simpli */ 
}
 , 0);
 return prev.filter(u => u.id !== id);
 
}
 return prev;
 
}
 );
 
}
 , [addUploads]);
 const removeUpload = useCallback((id: string) => {
 setUploads(prev => prev.filter(u => u.id !== id));
 
}
 , []);
 useEffect(() => {
 const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
 if (firebaseUser) {
 /* Optimistically set user immediately for fast logi */ setUser({
 id: firebaseUser.uid, name: firebaseUser.displayName || firebaseUser.email || 'User', email: firebaseUser.email || '', avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${
 encodeURIComponent(firebaseUser.displayName || 'U') 
}
 `, role: 'user', storageUsed: 0, storageLimit: 15 * 1024 * 1024 * 1024, plan: 'free' 
}
 );
 setAuthLoading(false);
 /* Listen to user profile in firestore to get storag */ const userDocRef = doc(db, 'users', firebaseUser.uid);
 onSnapshot(userDocRef, (docSnap) => {
 let limit = 15 * 1024 * 1024 * 1024;
 /* Default 15 GB */ let plan = 'free';
 if (docSnap.exists()) {
 const data = docSnap.data();
 if (data.storageLimit) limit = data.storageLimit;
 if (data.plan) plan = data.plan;
 
}
 else {
 /* Create initial user doc */ setDoc(userDocRef, {
 plan: 'free', storageLimit: limit, createdAt: Date.now() 
}
 , {
 merge: true 
}
 );
 
}
 setUser(prev => prev ? {
 ...prev, storageLimit: limit, plan: plan 
}
 : null);
 
}
 );
 
}
 else {
 setUser(null);
 setFiles([]);
 setAuthLoading(false);
 
}
 
}
 );
 return () => unsubscribe();
 
}
 , []);
 useEffect(() => {
 if (user) {
 setIsLoadingFiles(true);
 const unsubscribe = fileService.subscribeToUserFiles(user.id, (fetchedFiles) => {
 setFiles(fetchedFiles);
 setIsLoadingFiles(false);
 
}
 , (error) => {
 console.error("Error loading files", error);
 setIsLoadingFiles(false);
 
}
 );
 return () => unsubscribe();
 
}
 else {
 setIsLoadingFiles(false);
 
}
 
}
 , [user?.id]);
 /* Depend on user.id instead of user object to avoid unnecessary subscriptions */ useEffect(() => {
 if (user && files) {
 const totalSize = files.reduce((acc, file) => {
 if (!file.isDeleted && typeof file.size === 'number') {
 return acc + file.size;
 
}
 return acc;
 
}
 , 0);
 setUser(prev => prev ? {
 ...prev, storageUsed: totalSize 
}
 : prev);
 
}
 
}
 , [files]);
 /* Re-calculate when files array changes */ useEffect(() => {
 localStorage.setItem('theme', theme);
 const root = window.document.documentElement;
 root.classList.remove('light', 'dark');
 if (theme === 'system') {
 const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
 root.classList.add(systemTheme);
 
}
 else {
 root.classList.add(theme);
 
}
 
}
 , [theme]);
 const logout = () => {
 auth.signOut();
 
}
 ;
 return ( <AppContext.Provider value={
 {
 user, setUser, files, setFiles, currentFolderId, setCurrentFolderId, selectedFileId, setSelectedFileId, viewMode, setViewMode, theme, setTheme, searchQuery, setSearchQuery, advancedFilters, setAdvancedFilters, isSidebarOpen, setIsSidebarOpen, logout, isLoadingFiles, authLoading, uploads, addUploads, cancelUpload, retryUpload, removeUpload, 
}
 
}
 > {
 children 
}
 </AppContext.Provider> );
 
}
 export function useAppContext() {
 const context = useContext(AppContext);
 if (context === undefined) {
 throw new Error('useAppContext must be used within an AppProvider');
 
}
 return context;
 
}
 