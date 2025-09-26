'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageFeatures {
  hash: string;
  colorHistogram: number[];
  edgeHash: string;
  brightness: number;
  fileName: string;
  fileSize: number;
}

// Enhanced function to calculate more detailed image features
const calculateImageFeatures = async (file: File): Promise<{
  hash: string;
  colorHistogram: number[];
  edgeHash: string;
  brightness: number;
  fileName: string;
  fileSize: number;
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 16;
        canvas.height = 16;

        if (ctx) {
          ctx.drawImage(img, 0, 0, 16, 16);
          const imageData = ctx.getImageData(0, 0, 16, 16);
          const data = imageData.data;

          // 1. Perceptual hash (16x16 for better accuracy)
          let hash = '';
          let totalBrightness = 0;

          for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            totalBrightness += gray;
            hash += gray > 128 ? '1' : '0';
          }

          // 2. Color histogram (simplified)
          const colorHistogram = new Array(16).fill(0);
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Group colors into 16 bins
            const colorBin = Math.floor(((r + g + b) / 3) / 16);
            const safeBin = Math.min(colorBin, 15);
            colorHistogram[safeBin]++;
          }

          // 3. Edge detection hash
          let edgeHash = '';
          for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
              const current = (y * 16 + x) * 4;
              const right = (y * 16 + (x + 1)) * 4;
              const below = ((y + 1) * 16 + x) * 4;

              const currentGray = (data[current] + data[current + 1] + data[current + 2]) / 3;
              const rightGray = (data[right] + data[right + 1] + data[right + 2]) / 3;
              const belowGray = (data[below] + data[below + 1] + data[below + 2]) / 3;

              const edgeStrength = Math.abs(currentGray - rightGray) + Math.abs(currentGray - belowGray);
              edgeHash += edgeStrength > 30 ? '1' : '0';
            }
          }

          resolve({
            hash,
            colorHistogram,
            edgeHash,
            brightness: totalBrightness / (data.length / 4),
            fileName: file.name.toLowerCase(),
            fileSize: file.size
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
}

export function FileUpload({ onFilesAccepted }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<Array<{
    file1: string;
    file2: string;
    similarity: string;
  }>>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const allFiles = [...files, ...acceptedFiles];

    // Check for image duplicates
    const duplicateResults: Array<{file1: string; file2: string; similarity: string;}> = [];

    // Calculate features for new files
    const newFeatures = await Promise.all(
      acceptedFiles.map(async (file) => await calculateImageFeatures(file))
    );

    // Calculate features for existing files
    const existingFeatures = await Promise.all(
      files.map(async (file) => await calculateImageFeatures(file))
    );

    // Check for duplicates between new and existing files
    for (let i = 0; i < newFeatures.length; i++) {
      for (let j = 0; j < existingFeatures.length; j++) {
        const similarity = calculateAdvancedSimilarity(newFeatures[i], existingFeatures[j]);

        if (similarity.isDuplicate) {
          duplicateResults.push({
            file1: acceptedFiles[i].name,
            file2: files[j].name,
            similarity: `${similarity.confidence.toFixed(1)}%`
          });
        }
      }
    }

    // Check for duplicates within new files
    for (let i = 0; i < newFeatures.length; i++) {
      for (let j = i + 1; j < newFeatures.length; j++) {
        const similarity = calculateAdvancedSimilarity(newFeatures[i], newFeatures[j]);

        if (similarity.isDuplicate) {
          duplicateResults.push({
            file1: acceptedFiles[i].name,
            file2: acceptedFiles[j].name,
            similarity: `${similarity.confidence.toFixed(1)}%`
          });
        }
      }
    }

    setDuplicateWarnings(duplicateResults);
    setFiles(allFiles);
    onFilesAccepted(allFiles);
  }, [onFilesAccepted, files]);

  // Advanced similarity calculation using multiple features
  const calculateAdvancedSimilarity = (features1: ImageFeatures, features2: ImageFeatures): {isDuplicate: boolean, confidence: number} => {
    // 1. Exact file check (same name and size)
    if (features1.fileName === features2.fileName && features1.fileSize === features2.fileSize) {
      return { isDuplicate: true, confidence: 100 };
    }

    // 2. Perceptual hash similarity
    const hashSimilarity = calculateHashSimilarity(features1.hash, features2.hash);

    // 3. Edge pattern similarity
    const edgeSimilarity = calculateHashSimilarity(features1.edgeHash, features2.edgeHash);

    // 4. Color histogram similarity
    const colorSimilarity = calculateColorHistogramSimilarity(features1.colorHistogram, features2.colorHistogram);

    // 5. Brightness similarity
    const brightnessDiff = Math.abs(features1.brightness - features2.brightness);
    const brightnessSimilarity = Math.max(0, 100 - brightnessDiff);

    // Weighted combination - all must be high for duplicate detection
    const combinedScore = (
      hashSimilarity * 0.4 +        // 40% - structural similarity
      edgeSimilarity * 0.3 +        // 30% - edge patterns
      colorSimilarity * 0.2 +       // 20% - color distribution
      brightnessSimilarity * 0.1    // 10% - overall brightness
    );

    // Very strict threshold - only flag if nearly identical
    // AND multiple features agree (not just one high score)
    const isDuplicate = combinedScore > 98 &&
                       hashSimilarity > 95 &&
                       edgeSimilarity > 90;

    return { isDuplicate, confidence: combinedScore };
  };

  // Basic hash similarity
  const calculateHashSimilarity = (hash1: string, hash2: string): number => {
    if (hash1.length !== hash2.length) return 0;

    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }

    return (matches / hash1.length) * 100;
  };

  // Color histogram similarity
  const calculateColorHistogramSimilarity = (hist1: number[], hist2: number[]): number => {
    if (hist1.length !== hist2.length) return 0;

    let totalDiff = 0;
    const total1 = hist1.reduce((sum, val) => sum + val, 0);
    const total2 = hist2.reduce((sum, val) => sum + val, 0);

    for (let i = 0; i < hist1.length; i++) {
      const norm1 = hist1[i] / total1;
      const norm2 = hist2[i] / total2;
      totalDiff += Math.abs(norm1 - norm2);
    }

    return Math.max(0, 100 - (totalDiff * 50));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (fileToRemove: File) => {
    const updatedFiles = files.filter(file => file !== fileToRemove);
    setFiles(updatedFiles);
    setDuplicateWarnings([]); // Clear duplicate warnings when files change
    onFilesAccepted(updatedFiles);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setDuplicateWarnings([]);
    onFilesAccepted([]);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer transition-all duration-300 rounded-2xl border-2 border-dashed p-8 text-center ${
          isDragActive
            ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]'
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="space-y-3">
          <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all duration-300 ${
            isDragActive
              ? 'bg-blue-500 scale-110'
              : 'bg-gradient-to-r from-slate-400 to-slate-500 hover:from-blue-400 hover:to-blue-500'
          }`}>
            {isDragActive ? (
              <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          <div>
            {isDragActive ? (
              <div className="space-y-1">
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  Drop here!
                </p>
                <p className="text-sm text-blue-500 dark:text-blue-300">
                  Release to upload
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Drop receipts or <span className="text-blue-600 dark:text-blue-400">click to browse</span>
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  PNG, JPG, JPEG supported
                </p>
              </div>
            )}
          </div>
        </div>

        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl bg-blue-400/10 dark:bg-blue-500/10 border-2 border-blue-400 dark:border-blue-500 animate-pulse" />
        )}
      </div>

      {/* Duplicate Image Warning */}
      {duplicateWarnings.length > 0 && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-l-4 border-red-500">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-red-800 dark:text-red-300 font-semibold mb-2">
                🚫 Duplicate Images Detected!
              </h4>
              <div className="text-sm text-red-700 dark:text-red-400 space-y-2">
                <p className="mb-3">The following files appear to be identical or very similar:</p>
                {duplicateWarnings.map((warning, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-800 dark:text-slate-200">📄 {warning.file1}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">matches</div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">📄 {warning.file2}</div>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                        <span className="text-red-800 dark:text-red-300 text-sm font-bold">{warning.similarity}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs mt-3 italic">
                  💡 Consider removing duplicate files to avoid processing the same receipt multiple times.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File List with Header */}
      {files.length > 0 && (
        <div className="mt-4">
          {/* File List Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Uploaded Files ({files.length})
              </h3>
              <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full">
                {(files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(1)} MB total
              </div>
            </div>
            <button
              onClick={clearAllFiles}
              className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 text-xs font-medium rounded-lg transition-colors duration-200"
              title="Clear all files"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>

          {/* Scrollable File List */}
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {files.map((file, index) => {
              // Check if this file is part of a duplicate warning
              const isDuplicateFile = duplicateWarnings.some(warning =>
                warning.file1 === file.name || warning.file2 === file.name
              );

              return (
                <div key={index} className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 ${
                  isDuplicateFile
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100 dark:hover:bg-slate-600/50'
                }`}>
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isDuplicateFile
                        ? 'bg-gradient-to-r from-red-400 to-red-500'
                        : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    }`}>
                      {isDuplicateFile ? (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate max-w-48 ${
                        isDuplicateFile
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {isDuplicateFile && (
                          <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded font-medium">
                            DUPLICATE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(file)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isDuplicateFile
                        ? 'text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-800/30'
                        : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title="Remove file"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #64748b;
        }
      `}</style>
    </div>
  );
}