import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "./firebase";
import { FileItem } from "./mockData";
const DOCUMENTS_COLLECTION = "documents";
const FOLDERS_COLLECTION = "folders";
const ACTIVITY_COLLECTION = "activities";
export const fileService = {
  /* Subscribe to user's files */ subscribeToUserFiles: (
    userId: string,
    callback: (files: FileItem[]) => void,
    onError?: (error: any) => void
  ) => {
    const qDocs = query(
      collection(db, DOCUMENTS_COLLECTION),
      where("ownerId", "==", userId)
    );
    const qFolders = query(
      collection(db, FOLDERS_COLLECTION),
      where("ownerId", "==", userId)
    );
    let docsResult: FileItem[] = [];
    let foldersResult: FileItem[] = [];
    let docsLoaded = false;
    let foldersLoaded = false;
    const updateCallback = () => {
      callback([...foldersResult, ...docsResult]);
    };
    const unsubDocs = onSnapshot(
      qDocs,
      (snapshot) => {
        const files: FileItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          files.push({
            id: doc.id,
            name: data.title,
            type: data.type,
            size: data.size || 0,
            createdAt: new Date(data.createdAt).toISOString(),
            updatedAt: new Date(data.updatedAt).toISOString(),
            owner: data.ownerName || "Unknown",
            ownerId: data.ownerId,
            shared: data.sharedWith || [],
            sharedWith: data.sharedWith || [],
            starred: data.starred || false,
            parentId: data.parentId || null,
            url: data.url || undefined,
            content: data.content || undefined,
            isDeleted: data.isDeleted || false,
            deletedAt: data.deletedAt
              ? new Date(data.deletedAt).toISOString()
              : undefined,
          });
        });
        docsResult = files;
        docsLoaded = true;
        if (foldersLoaded) updateCallback();
      },
      (error) => {
        console.error("subscribeToUserFiles docs error:", error);
        if (onError) onError(error);
      }
    );
    const unsubFolders = onSnapshot(
      qFolders,
      (snapshot) => {
        const files: FileItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          files.push({
            id: doc.id,
            name: data.title,
            type: data.type,
            size: data.size || 0,
            createdAt: new Date(data.createdAt).toISOString(),
            updatedAt: new Date(data.updatedAt).toISOString(),
            owner: data.ownerName || "Unknown",
            ownerId: data.ownerId,
            shared: data.sharedWith || [],
            sharedWith: data.sharedWith || [],
            starred: data.starred || false,
            parentId: data.parentId || null,
            url: data.url || undefined,
            isDeleted: data.isDeleted || false,
            deletedAt: data.deletedAt
              ? new Date(data.deletedAt).toISOString()
              : undefined,
          });
        });
        foldersResult = files;
        foldersLoaded = true;
        if (docsLoaded) updateCallback();
      },
      (error) => {
        console.error("subscribeToUserFiles folders error:", error);
        if (onError) onError(error);
      }
    );
    return () => {
      unsubDocs();
      unsubFolders();
    };
  },
  /* Subscribe to user's activity */ subscribeToActivity: (
    userId: string,
    callback: (activity: any[]) => void
  ) => {
    const q = query(
      collection(db, ACTIVITY_COLLECTION),
      where("userId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
      const activities: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          user: data.userName,
          action: data.action,
          file: data.fileName,
          time: new Date(data.timestamp).toLocaleString(),
          timestamp: data.timestamp,
        });
      });
      callback(activities.sort((a, b) => b.timestamp - a.timestamp));
    });
  },
  logActivity: async (action: string, fileName: string) => {
    if (!auth.currentUser) return;
    const docRef = doc(collection(db, ACTIVITY_COLLECTION));
    await setDoc(docRef, {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || "You",
      action,
      fileName,
      timestamp: Date.now(),
    });
  },
  /* Create a new document/folder */ createFolder: async (
    name: string,
    parentId: string | null
  ) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const docRef = doc(collection(db, FOLDERS_COLLECTION));
    const now = Date.now();
    await setDoc(docRef, {
      title: name,
      ownerId: auth.currentUser.uid,
      ownerName: auth.currentUser.displayName || "User",
      type: "folder",
      size: 0,
      parentId: parentId || null,
      sharedWith: [],
      starred: false,
      url: null,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      tags: [],
    });
    await fileService.logActivity("created folder", name);
    return docRef.id;
  },
  createDocument: async (name: string, parentId: string | null) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const docRef = doc(collection(db, DOCUMENTS_COLLECTION));
    const now = Date.now();
    await setDoc(docRef, {
      title: name,
      ownerId: auth.currentUser.uid,
      ownerName: auth.currentUser.displayName || "User",
      type: "text",
      size: 0,
      parentId: parentId || null,
      sharedWith: [],
      starred: false,
      url: null,
      content: "",
      /* Initial content */ isDeleted: false,
      createdAt: now,
      updatedAt: now,
      tags: [],
    });
    await fileService.logActivity("created document", name);
    return docRef.id;
  },
  getFileContent: async (docId: string): Promise<string | null> => {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().content) {
        return docSnap.data().content;
      }
      const chunksRef = collection(db, DOCUMENTS_COLLECTION, docId, "chunks");
      const q = query(chunksRef, orderBy("index"));
      const chunkSnaps = await getDocs(q);
      if (chunkSnaps.empty) return null;
      let fullContent = "";
      chunkSnaps.forEach((snap) => {
        fullContent += snap.data().data;
      });
      return fullContent;
    } catch (err) {
      console.error("Error getting file content chunks:", err);
      return null;
    }
  },
    startUpload: (
    file: File,
    parentId: string | null,
    existingDocId?: string
  ) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    /* File validation */ if (file.size > 100 * 1024 * 1024) {
      /* 100MB limit */ throw new Error("File size exceeds 100MB limit");
    }

    const docRef = existingDocId 
      ? doc(db, DOCUMENTS_COLLECTION, existingDocId)
      : doc(collection(db, DOCUMENTS_COLLECTION));
    const docId = docRef.id;

    let uploadedUrl = "";
    let uploadError: Error | null = null;
    let uploadComplete = false;
    let resolveUpload: (() => void) | null = null;
    const uploadFinished = new Promise<void>((resolve) => {
      resolveUpload = resolve;
    });
    const xhr = new XMLHttpRequest();
    const uploadTask = {
      on: (
        _event: string,
        _next: (snapshot: any) => void,
        error: (error: Error) => void,
        complete: () => void
      ) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            _next({
              bytesTransferred: event.loaded,
              totalBytes: event.total,
            });
          }
        };
        xhr.onerror = () => {
          uploadError = new Error("Upload failed. Check the server connection.");
          error(uploadError);
          resolveUpload?.();
        };
        xhr.onabort = () => {
          uploadError = new Error("Upload canceled.");
          error(uploadError);
          resolveUpload?.();
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const result = JSON.parse(xhr.responseText);
            uploadedUrl = result.file.url;
            uploadComplete = true;
            complete();
          } else {
            uploadError = new Error(`Upload failed (${xhr.status}).`);
            error(uploadError);
          }
          resolveUpload?.();
        };
        const formData = new FormData();
        formData.append("file", file);
        xhr.open("POST", "/api/files/upload");
        xhr.send(formData);
        return () => xhr.abort();
      },
      cancel: () => xhr.abort(),
    };

    const finalizeUpload = async () => {
      let type = "unknown";
      const name = file.name.toLowerCase();
      if (file.type.includes("pdf") || name.endsWith(".pdf")) type = "pdf";
      else if (
        file.type.includes("image") ||
        name.match(/\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff)$/)
      )
        type = "image";
      else if (
        file.type.includes("word") ||
        name.match(/\.(doc|docx|odt|rtf)$/)
      )
        type = "word";
      else if (
        file.type.includes("excel") ||
        file.type.includes("spreadsheet") ||
        name.match(/\.(xls|xlsx|csv|ods)$/)
      )
        type = "excel";
      else if (
        file.type.includes("powerpoint") ||
        file.type.includes("presentation") ||
        name.match(/\.(ppt|pptx|odp)$/)
      )
        type = "presentation";
      else if (
        file.type.includes("text") ||
        name.match(/\.(txt|md|json|xml|html)$/)
      )
        type = "text";
      else if (
        file.type.includes("video") ||
        name.match(/\.(mp4|webm|ogg|mov)$/)
      )
        type = "video";
      else if (file.type.includes("audio") || name.match(/\.(mp3|wav|ogg)$/))
        type = "audio";
      else if (
        file.type.includes("zip") ||
        file.type.includes("compressed") ||
        name.match(/\.(zip|rar|7z|tar|gz|exe|apk|dmg|iso)$/)
      )
        type = "archive";
      else type = "file";

      const now = Date.now();
      await uploadFinished;
      if (!uploadComplete || uploadError) {
        throw uploadError || new Error("Upload did not complete.");
      }

      if (existingDocId) {
        try {
          const oldDoc = await getDoc(docRef);
          if (oldDoc.exists()) {
            const oldData = oldDoc.data() as any;
            const versionRef = doc(
              collection(db, DOCUMENTS_COLLECTION, existingDocId, "versions")
            );
            
            // Only tracking version metadata, not full file chunks for binary uploads
            await setDoc(versionRef, {
              url: oldData.url || "",
              createdBy: auth.currentUser.uid,
              createdAt: new Date(),
              isChunked: false,
              content: "",
            });
          }
        } catch (err) {
          console.error("Failed to save previous version", err);
        }
      }

      await setDoc(docRef, {
        title: file.name,
        type,
        size: file.size,
        url: uploadedUrl,
        parentId,
        ownerId: auth.currentUser.uid,
        ownerName: auth.currentUser.displayName || auth.currentUser.email || "Unknown",
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
        starred: false,
        sharedWith: [],
      });
    };

    return {
      uploadTask,
      finalizeUpload,
      docId,
    };
  },
  /* Upload file to storage and create document record */ uploadFile: async (
    file: File,
    parentId: string | null,
    onProgress?: (progress: number) => void
  ) => {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const docRef = doc(collection(db, DOCUMENTS_COLLECTION));
    const docId = docRef.id;
    const storageRef = ref(
      storage,
      `users/${auth.currentUser.uid}/${docId}/${file.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          let type = "unknown";
          const name = file.name.toLowerCase();
          if (file.type.includes("pdf") || name.endsWith(".pdf")) type = "pdf";
          else if (
            file.type.includes("image") ||
            name.match(/\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff)$/)
          )
            type = "image";
          else if (
            file.type.includes("word") ||
            name.match(/\.(doc|docx|odt|rtf)$/)
          )
            type = "word";
          else if (
            file.type.includes("excel") ||
            file.type.includes("spreadsheet") ||
            name.match(/\.(xls|xlsx|csv|ods)$/)
          )
            type = "excel";
          else if (
            file.type.includes("powerpoint") ||
            file.type.includes("presentation") ||
            name.match(/\.(ppt|pptx|odp)$/)
          )
            type = "presentation";
          else if (
            file.type.includes("text") ||
            name.match(/\.(txt|md|json|xml|html)$/)
          )
            type = "text";
          else if (
            file.type.includes("video") ||
            name.match(/\.(mp4|webm|ogg|mov)$/)
          )
            type = "video";
          else if (
            file.type.includes("audio") ||
            name.match(/\.(mp3|wav|ogg)$/)
          )
            type = "audio";
          else if (
            file.type.includes("zip") ||
            file.type.includes("compressed") ||
            name.match(/\.(zip|rar|7z|tar|gz|exe|apk|dmg|iso)$/)
          )
            type = "archive";
          else type = "file";
          const now = Date.now();
          await setDoc(docRef, {
            title: file.name,
            ownerId: auth.currentUser!.uid,
            ownerName: auth.currentUser!.displayName || "User",
            type: type,
            size: file.size,
            parentId: parentId,
            sharedWith: [],
            starred: false,
            url: downloadURL,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
            tags: [],
          });
          await fileService.logActivity("uploaded", file.name);
          resolve(docId);
        }
      );
    });
  },
  /* Update a document */ updateDocument: async (
    id: string,
    updates: Partial<FileItem> & {
      content?: string;
    },
    isFolder?: boolean
  ) => {
    const docRef = doc(
      db,
      isFolder ? FOLDERS_COLLECTION : DOCUMENTS_COLLECTION,
      id
    );
    const firestoreUpdates: any = {
      updatedAt: Date.now(),
    };
    if (updates.name !== undefined) firestoreUpdates.title = updates.name;
    if (updates.starred !== undefined)
      firestoreUpdates.starred = updates.starred;
    if (updates.parentId !== undefined)
      firestoreUpdates.parentId = updates.parentId;
    if (updates.content !== undefined)
      firestoreUpdates.content = updates.content;
    await updateDoc(docRef, firestoreUpdates);
  },
  /* Soft Delete a document */ moveToTrash: async (
    id: string,
    name: string,
    isFolder?: boolean
  ) => {
    const docRef = doc(
      db,
      isFolder ? FOLDERS_COLLECTION : DOCUMENTS_COLLECTION,
      id
    );
    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
    await fileService.logActivity("deleted", name);
  },
  /* Restore a document */ restoreFromTrash: async (
    id: string,
    name: string,
    isFolder?: boolean
  ) => {
    const docRef = doc(
      db,
      isFolder ? FOLDERS_COLLECTION : DOCUMENTS_COLLECTION,
      id
    );
    await updateDoc(docRef, {
      isDeleted: false,
      deletedAt: null,
      updatedAt: Date.now(),
    });
    await fileService.logActivity("restored", name);
  },
  /* Permanently Delete a document */ deletePermanently: async (
    id: string,
    isFolder?: boolean
  ) => {
    if (!isFolder) {
      try {
        const chunksRef = collection(db, DOCUMENTS_COLLECTION, id, "chunks");
        const chunksSnap = await getDocs(chunksRef);
        for (const chunkDoc of chunksSnap.docs) {
          await deleteDoc(chunkDoc.ref);
        }
      } catch (e) {
        console.error("Failed to delete chunks", e);
      }
    }
    const docRef = doc(
      db,
      isFolder ? FOLDERS_COLLECTION : DOCUMENTS_COLLECTION,
      id
    );
    await deleteDoc(docRef);
  },
  createVersion: async (id: string, content: string) => {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, id);
      const oldDoc = await getDoc(docRef);
      if (oldDoc.exists()) {
        const oldData = oldDoc.data() as any;
        const versionRef = doc(
          collection(db, DOCUMENTS_COLLECTION, id, "versions")
        );
        await setDoc(versionRef, {
          url: oldData.url || "",
          createdBy: auth.currentUser?.uid || "unknown",
          createdAt: new Date(),
          isChunked: content.length > 800000,
          content: content.length <= 800000 ? content : "",
        });
        if (content.length > 800000) {
          const numChunks = Math.ceil(content.length / 800000);
          for (let i = 0; i < numChunks; i++) {
            await setDoc(
              doc(
                db,
                DOCUMENTS_COLLECTION,
                id,
                "versions",
                versionRef.id,
                "chunks",
                i.toString()
              ),
              {
                index: i,
                data: content.slice(i * 800000, (i + 1) * 800000),
              }
            );
          }
        }
        await fileService.logActivity("created_version", oldData.title);
      }
    } catch (err) {
      console.error("Failed to save version", err);
    }
  },
  /* Update User Subscription */ updateSubscription: async (
    userId: string,
    plan: string,
    storageLimitBytes: number
  ) => {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        plan,
        storageLimit: storageLimitBytes,
        updatedAt: Date.now(),
      },
      {
        merge: true,
      }
    );
  },
};
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}
 ${sizes[i]}
 `;
}
