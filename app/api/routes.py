from fastapi import APIRouter, UploadFile, File, HTTPException, Request, status
from typing import List
import os
import tempfile

from app.services.document_processor import process_documents
from app.services.llm_service import extract_data_from_document
from app.core.config import settings
from app.core.database import SessionLocal, Document, init_db, UPLOAD_DIR
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

router = APIRouter()
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload", response_model=dict)
async def upload_documents(
    files: List[UploadFile] = File(...),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    db: Session = next(get_db())
    doc_ids = []
    extracted_data = {}

    for file in files:
        if not file.filename.lower().endswith(tuple(settings.ALLOWED_DOCUMENT_TYPES)):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}")

        # Save uploaded file to uploads directory
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Process and extract data
        document_data = process_documents([file_path])
        document_text = "\n\n".join([f"Document {key}:\n{value}" for key, value in document_data.items()])
        data = extract_data_from_document(document_text)
        extracted_data[file.filename] = data

        # Save to DB
        doc = Document(
            filename=file.filename,
            file_path=file_path,
            extracted_data=data,
            edited_data=None,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        doc_ids.append(doc.id)

    return {"doc_ids": doc_ids, "extracted_data": extracted_data}

@router.post("/save-edited-data")
async def save_edited_data(request: Request):
    db: Session = next(get_db())
    data = await request.json()
    doc_id = data.get("doc_id")
    edited_data = data.get("edited_data")
    if not doc_id or edited_data is None:
        raise HTTPException(status_code=400, detail="doc_id and edited_data required")
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.edited_data = edited_data
    db.commit()
    return {"status": "success", "message": "Data saved!"}

@router.get("/documents")
def get_documents():
    db: Session = next(get_db())
    docs = db.query(Document).all()
    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "upload_time": doc.upload_time,
            "extracted_data": doc.extracted_data,
            "edited_data": doc.edited_data,
        }
        for doc in docs
    ]

@router.get("/document/{doc_id}")
def get_document(doc_id: int):
    db: Session = next(get_db())
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": doc.id,
        "filename": doc.filename,
        "upload_time": doc.upload_time,
        "extracted_data": doc.extracted_data,
        "edited_data": doc.edited_data,
    }

@router.get("/file/{filename}")
def get_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.delete("/document/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int):
    db: Session = next(get_db())
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Delete file from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    db.delete(doc)
    db.commit()
    return 
