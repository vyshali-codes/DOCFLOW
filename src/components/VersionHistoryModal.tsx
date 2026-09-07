import React, {
 useEffect, useState 
}
 from "react";

import {
 X, Clock, Download, RotateCcw 
}
 from "lucide-react";

import {
 fileService 
}
 from "../lib/fileService";

import {
 FileItem 
}
 from "../lib/mockData";

import {

  collection,
  query,
  orderBy,
  getDocs,
  doc,
  setDoc,

}
 from "firebase/firestore";

import {
 db, auth 
}
 from "../lib/firebase";

import {
 format 
}
 from "date-fns";

export function VersionHistoryModal({

  file,
  onClose,

}
: {

  file: FileItem;

  onClose: () => void;


}
) {

  const [versions, setVersions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchVersions = async () => {

      try {

        const versionsRef = collection(db, "documents", file.id, "versions");

        const q = query(versionsRef, orderBy("createdAt", "desc"));

        const snaps = await getDocs(q);

        const data = snaps.docs.map((doc) => ({
 id: doc.id, ...doc.data() 
}
));

        setVersions(data);

      
}
 catch (err) {

        console.error("Failed to fetch versions", err);

      
}
 finally {

        setLoading(false);

      
}

    
}
;

    fetchVersions();

  
}
, [file.id]);

  const fetchVersionContent = async (version: any) => {

    if (version.content) return version.content;

    if (version.isChunked) {

      const chunksRef = collection(
        db,
        "documents",
        file.id,
        "versions",
        version.id,
        "chunks"
      );

      const q = query(chunksRef, orderBy("index"));

      const snaps = await getDocs(q);

      let full = "";

      snaps.forEach((s) => (full += s.data().data));

      return full;

    
}

    return "";

  
}
;

  const handleRestore = async (version: any) => {

    try {

      setLoading(true);

      const currentContent = await fileService.getFileContent(file.id);

      if (currentContent) {

        const vRef = doc(collection(db, "documents", file.id, "versions"));

        const isChunked = currentContent.length > 800000;

        await setDoc(vRef, {

          content: isChunked ? "" : currentContent,
          isChunked,
          createdBy: auth.currentUser?.uid,
          createdAt: new Date(),
          isAutoBackup: true,
        
}
);

        if (isChunked) {

          const numChunks = Math.ceil(currentContent.length / 800000);

          for (let i = 0;
 i < numChunks;
 i++) {

            await setDoc(
              doc(
                db,
                "documents",
                file.id,
                "versions",
                vRef.id,
                "chunks",
                i.toString()
              ),
              {

                index: i,
                data: currentContent.slice(i * 800000, (i + 1) * 800000),
              
}

            );

          
}

        
}

      
}

      const vContent = await fetchVersionContent(version);

      /* Overwrite current file chunks */ if (vContent.length > 800000) {

        await fileService.updateDocument(file.id, {
 content: "" } as any);

        const numChunks = Math.ceil(vContent.length / 800000);

        for (let i = 0;
 i < numChunks;
 i++) {

          await setDoc(doc(db, "documents", file.id, "chunks", i.toString()), {

            index: i,
            data: vContent.slice(i * 800000, (i + 1) * 800000),
          
}
);

        
}

      
}
 else {

        await fileService.updateDocument(file.id, {
 content: vContent } as any);

      
}

      onClose();

    
}
 catch (err) {

      console.error(err);

      setLoading(false);

    
}

  
}
;

  const handleDownload = async (version: any) => {

    const content = await fetchVersionContent(version);

    if (!content) return;

    const a = document.createElement("a");

    a.href = content.startsWith("data:")
      ? content
      : "data:" + file.type + ";base64," + content;

    a.download =
      (version.createdAt?.toDate
        ? version.createdAt.toDate().toISOString()
        : new Date(version.createdAt).toISOString()) +
      "_" +
      file.name;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

  
}
;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-bg/50 backdrop-blur-sm"
      onClick={
(e) => e.stopPropagation()
}

    >
      {
" "
}

      <div
        className="bg-theme-card rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden"
        onClick={
(e) => e.stopPropagation()
}

      >
        {
" "
}

        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          {
" "
}

          <h2 className="text-lg font-semibold flex items-center gap-2">
            {
" "
}

            <Clock className="w-5 h-5 text-theme-muted" /> Version History{
" "
}

          </h2>{
" "
}

          <button
            onClick={
onClose
}

            className="p-1 hover:bg-theme-card-hover rounded-md"
          >
            {
" "
}

            <X className="w-5 h-5" />{
" "
}

          </button>{
" "
}

        </div>{
" "
}

        <div className="p-4 flex-1 overflow-auto max-h-[60vh]">
          {
" "
}

          {
loading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center text-theme-muted py-8">
              No previous versions found for this file.
            </p>
          ) : (
            <div className="space-y-4">
              {
" "
}

              {
versions.map((v, i) => (
                <div
                  key={
v.id
}

                  className="flex items-center justify-between p-4 border border-theme-border rounded-lg bg-theme-bg"
                >
                  {
" "
}

                  <div>
                    {
" "
}

                    <p className="font-medium text-theme-text">
                      Version {
versions.length - i
}
{
" "
}

                    </p>{
" "
}

                    <p className="text-sm text-theme-muted">
                      {
v.createdAt?.toDate
                        ? v.createdAt.toDate().toLocaleString()
                        : new Date(v.createdAt).toLocaleString()
}
{
" "
}

                    </p>{
" "
}

                    {
v.isAutoBackup && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                        Auto Backup
                      </span>
                    )
}
{
" "
}

                  </div>{
" "
}

                  <div className="flex items-center gap-2">
                    {
" "
}

                    <button
                      onClick={
() => handleDownload(v)
}

                      className="p-2 text-theme-muted hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Download this version"
                    >
                      {
" "
}

                      <Download className="w-4 h-4" />{
" "
}

                    </button>{
" "
}

                    <button
                      onClick={
() => handleRestore(v)
}

                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-md"
                      title="Restore this version"
                    >
                      {
" "
}

                      <RotateCcw className="w-4 h-4" /> Restore{
" "
}

                    </button>{
" "
}

                  </div>{
" "
}

                </div>
              ))
}
{
" "
}

            </div>
          )
}
{
" "
}

        </div>{
" "
}

      </div>{
" "
}

    </div>
  );


}

