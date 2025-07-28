import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as XLSX from 'xlsx';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const DocumentViewer = ({ files }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [sheets, setSheets] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const handleSelectFile = index => {
    setSelectedFileIndex(index);
    setSheets(null);
    setNumPages(null);
    const file = files[index];
    if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const reader = new FileReader();
      reader.onload = e => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        setSheets(
          workbook.SheetNames.map(name => ({
            name,
            data: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
              header: 1,
            }),
          }))
        );
      };
      reader.readAsBinaryString(file);
    } else if (file.type === 'application/pdf') {
      // For PDF, numPages set on load
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const selectedFile =
    selectedFileIndex !== null ? files[selectedFileIndex] : null;

  return (
    <div className="document-viewer-card">
      <h3 className="text-xl font-semibold mb-2">Uploaded Documents</h3>
      <ul>
        {files.map((file, index) => (
          <li
            key={index}
            onClick={() => handleSelectFile(index)}
            className={selectedFileIndex === index ? 'selected' : ''}
          >
            {file.name}
          </li>
        ))}
      </ul>
      {selectedFile && selectedFile.type === 'application/pdf' && (
        <div className="pdf-viewer">
          <Document file={selectedFile} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={1.0}
                className="mb-4"
              />
            ))}
          </Document>
        </div>
      )}
      {sheets && (
        <div className="xlsx-viewer">
          {sheets.map((sheet, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="text-lg font-medium">{sheet.name}</h4>
              <table className="table-auto border-collapse border border-gray-400 w-full text-sm">
                <tbody>
                  {sheet.data.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="border border-gray-300 p-1">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
