# Document Processing Application

This platform processes shipment documents (PDF/XLSX), extracts structured data using the Anthropic API, and provides a modern UI for upload, review, and editing.

---

## Features

- Upload multiple shipment documents (PDF/XLSX)
- Extract structured data (fields based on [Google Form schema](https://forms.gle/11kUya5nTebvFBgn7))
- Editable form for extracted data
- View original documents alongside extracted data
- Save and persist edits (SQLite + file storage)
- Delete documents
- Evaluation script for extraction quality
- Fully containerized with Docker Compose

---

## Local Development Setup

1. **Clone the repository**
2. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Set Anthropic API key:**
   ```bash
   export ANTHROPIC_API_KEY="your-anthropic-key"
   ```
   Or add it to a `.env` file.
4. **Run the backend:**
   ```bash
   python -m app.main
   ```
5. **Run the frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
6. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Dockerized Workflow

**Build and run everything with Docker Compose:**
```bash
docker-compose up --build
```

- The backend (FastAPI) runs on port **8000**
- The frontend (React, served by Nginx) runs on port **3000**
- Set your `ANTHROPIC_API_KEY` in your environment or a `.env` file before running

**Stop containers:**
```bash
docker-compose down
```

---

## API Endpoints

- `POST /upload`: Upload and process documents
- `POST /save-edited-data`: Save edited extracted data
- `GET /documents`: List all documents
- `GET /document/{doc_id}`: Get a specific document
- `DELETE /document/{doc_id}`: Delete a document
- `GET /file/{filename}`: Download/view original file

---

## Frontend

- Modern React UI (custom CSS, no Tailwind)
- Drag-and-drop upload, editable forms, modal document viewer
- Document list with delete and selection features

---

## Code Formatting

**Prettier** is used for consistent code style in the frontend.

- To format all frontend code:
  ```bash
  cd frontend
  npm run format
  ```

---

## Testing

**Backend tests:**
```bash
pytest
```

---

## Evaluation

Run the evaluation script to check extraction quality:
```bash
python evaluation.py
```

---

## Assumptions

- Documents are PDFs or XLSX in standard shipment formats
- Extraction fields are based on typical shipment details
- Mock ground truth data is used in `evaluation.py`
- Anthropic API is used for extraction; key must be set
- For production, secure API key handling and add authentication as needed
- Caching and advanced error handling are not implemented

---

## Troubleshooting

- If you see errors about missing dependencies, rerun the install commands.
- For Docker issues, ensure Docker Desktop is running and you have enough resources allocated.
- For Anthropic API errors, double-check your API key and model name in `app/services/llm_service.py`.

---