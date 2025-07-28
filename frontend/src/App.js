import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EditableForm from './components/EditableForm';
import DocumentModal from './components/DocumentModal';
import axios from 'axios';
import './App.css';

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalFileIndex, setModalFileIndex] = useState(0);

  // Fetch all documents on load
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await axios.get('http://localhost:8000/documents');
    setDocuments(res.data);
    if (res.data.length > 0 && !selectedDoc) {
      setSelectedDoc(res.data[0]);
      setUploadedFiles([
        {
          name: res.data[0].filename,
          url: `http://localhost:8000/file/${res.data[0].filename}`,
          type: res.data[0].filename.endsWith('.pdf')
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ]);
    }
  };

  // Handle upload and select the new doc
  const handleUploadSuccess = async (extractedData, files) => {
    await fetchDocuments();
    // Select the latest document
    const res = await axios.get('http://localhost:8000/documents');
    const latestDoc = res.data[res.data.length - 1];
    setSelectedDoc(latestDoc);
    setUploadedFiles(
      files.map(f => ({
        name: f.name,
        url: `http://localhost:8000/file/${f.name}`,
        type: f.type,
      }))
    );
  };

  // Handle save changes
  const handleSave = async editedData => {
    if (!selectedDoc) return;
    await axios.post('http://localhost:8000/save-edited-data', {
      doc_id: selectedDoc.id,
      edited_data: editedData,
    });
    await fetchDocuments();
    alert('Changes saved!');
  };

  // Handle document selection
  const handleSelectDoc = async doc => {
    setSelectedDoc(doc);
    setUploadedFiles([
      {
        name: doc.filename,
        url: `http://localhost:8000/file/${doc.filename}`,
        type: doc.filename.endsWith('.pdf')
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ]);
  };

  const handleDeleteDoc = async docId => {
    if (!window.confirm('Are you sure you want to delete this document?'))
      return;
    await axios.delete(`http://localhost:8000/document/${docId}`);
    await fetchDocuments();
    if (selectedDoc && selectedDoc.id === docId) {
      setSelectedDoc(null);
      setUploadedFiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Shipment Document Processor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your documents and extract structured data instantly. Support
            for PDF and Excel files with AI-powered data extraction.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onFileClick={idx => {
                setModalFileIndex(idx);
                setShowModal(true);
              }}
            />
          </div>
        </div>

        {/* Document List */}
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-xl font-semibold mb-2">Saved Documents</h2>
          <ul className="space-y-2">
            {documents.map(doc => (
              <li
                key={doc.id}
                className={`document-list-item${selectedDoc && doc.id === selectedDoc.id ? ' selected' : ''}`}
                onClick={() => handleSelectDoc(doc)}
              >
                <span>
                  <span className="document-list-filename">{doc.filename}</span>
                  <span className="document-list-date">
                    {new Date(doc.upload_time).toLocaleString()}
                  </span>
                </span>
                <button
                  className="delete-doc-btn"
                  title="Delete document"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteDoc(doc.id);
                  }}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Editable Form and Document Modal */}
        {selectedDoc && (
          <>
            <div className="flex justify-end max-w-4xl mx-auto mt-8">
              <button
                className="view-document-btn"
                onClick={() => setShowModal(true)}
              >
                View Document
              </button>
            </div>
            <div className="max-w-4xl mx-auto">
              <EditableForm
                data={selectedDoc.edited_data || selectedDoc.extracted_data}
                onSave={handleSave}
              />
            </div>
            <DocumentModal
              open={showModal}
              onClose={() => setShowModal(false)}
              files={uploadedFiles}
              initialFileIndex={modalFileIndex}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
