import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as XLSX from 'xlsx';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const DocumentModal = ({ open, onClose, files, initialFileIndex = 0 }) => {
  const [selectedFileIndex, setSelectedFileIndex] =
    React.useState(initialFileIndex);
  const [sheets, setSheets] = React.useState(null);
  const [numPages, setNumPages] = React.useState(null);

  React.useEffect(() => {
    setSelectedFileIndex(initialFileIndex);
    setSheets(null);
    setNumPages(null);
  }, [initialFileIndex, open]);

  React.useEffect(() => {
    if (!open) return;
    const file = files[selectedFileIndex];
    if (
      file &&
      (file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        (file.name && file.name.endsWith('.xlsx')))
    ) {
      // Support both File/Blob and URL string
      const handleBlob = blob => {
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
        reader.readAsBinaryString(blob);
      };

      if (file instanceof File || file instanceof Blob) {
        handleBlob(file);
      } else if (typeof file === 'string' || file.url) {
        // file is a URL string or an object with a url property
        const url = typeof file === 'string' ? file : file.url;
        fetch(url)
          .then(res => res.blob())
          .then(handleBlob);
      }
    } else {
      setSheets(null);
    }
  }, [selectedFileIndex, files, open]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!open) return null;

  const selectedFile = files[selectedFileIndex];

  return (
    <div className="modal-overlay">
      <div className="modal-drawer">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Document Viewer</h2>
        <ul className="modal-file-list">
          {files.map((file, idx) => (
            <li
              key={idx}
              className={selectedFileIndex === idx ? 'selected' : ''}
              onClick={() => setSelectedFileIndex(idx)}
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
    </div>
  );
};

export default DocumentModal;
