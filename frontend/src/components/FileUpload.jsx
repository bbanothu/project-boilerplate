import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess, onFileClick }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = async acceptedFiles => {
    setIsUploading(true);
    // Append new files to the existing list, filtering out duplicates by name+size
    setUploadedFiles(prev => {
      const allFiles = [...prev, ...acceptedFiles];
      // Remove duplicates (by name+size)
      const uniqueFiles = Array.from(
        new Map(allFiles.map(f => [f.name + f.size, f])).values()
      );
      return uniqueFiles;
    });
    // Prepare form data for all files
    const allFiles = [...uploadedFiles, ...acceptedFiles];
    const uniqueFiles = Array.from(
      new Map(allFiles.map(f => [f.name + f.size, f])).values()
    );
    const formData = new FormData();
    uniqueFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(
        'http://localhost:8000/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      onUploadSuccess(response.data.extracted_data, uniqueFiles);
    } catch (error) {
      console.error('Upload error:', error);
      alert(
        'Error uploading files: ' +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    multiple: true,
  });

  return (
    <div className="text-center">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer upload-area ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 upload-title">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-gray-600 mb-4 upload-description">
              Drag & drop your PDF and Excel files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 upload-formats">
              Supported formats: PDF, XLSX
            </p>
          </div>

          <button
            type="button"
            className="upload-button"
            onClick={e => {
              e.stopPropagation();
              document.querySelector('input[type=\"file\"]').click();
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Choose Files'
            )}
          </button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-800 mb-3">
            Selected Files:
          </h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3 file-item cursor-pointer hover:bg-blue-50 transition"
                onClick={() => onFileClick && onFileClick(index)}
                title="Click to view this document"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{file.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
