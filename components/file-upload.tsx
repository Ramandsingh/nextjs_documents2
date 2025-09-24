'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
}

export function FileUpload({ onFilesAccepted }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    onFilesAccepted([...files, ...acceptedFiles]); // Pass all files including newly accepted ones
  }, [onFilesAccepted, files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter(file => file !== fileToRemove);
    setFiles(updatedFiles);
    onFilesAccepted(updatedFiles);
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
      <div {...getRootProps()} className="cursor-pointer p-4">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some receipt images here, or click to select files</p>
        )}
      </div>
      <div className="mt-4">
        {files.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-2">Selected Files:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index} className="flex justify-between items-center p-2 border-b border-gray-200">
                  <span>{file.name} - {(file.size / 1024).toFixed(2)} KB</span>
                  <button
                    onClick={() => removeFile(file)}
                    className="ml-4 px-2 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}