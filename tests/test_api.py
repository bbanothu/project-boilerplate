from fastapi.testclient import TestClient
from io import BytesIO
from app.main import app

client = TestClient(app)

def test_upload_documents():
    files = [
        ('files', ('test.pdf', BytesIO(b'Sample PDF content'), 'application/pdf')),
        ('files', ('test.xlsx', BytesIO(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))  # Minimal XLSX bytes
    ]
    response = client.post('/upload', files=files)
    assert response.status_code == 200
    assert 'extracted_data' in response.json()

def test_upload_no_files():
    response = client.post('/upload')
    assert response.status_code == 400
    assert 'detail' in response.json()

def test_upload_invalid_file():
    files = [('files', ('test.txt', BytesIO(b'text'), 'text/plain'))]
    response = client.post('/upload', files=files)
    assert response.status_code == 400
    assert 'detail' in response.json()

def test_upload_api_failure(mocker):
    # Mock LLM to raise error
    mocker.patch('app.services.llm_service.client.messages.create', side_effect=Exception('LLM error'))
    files = [('files', ('test.pdf', BytesIO(b'content'), 'application/pdf'))]
    response = client.post('/upload', files=files)
    assert response.status_code == 200  # Or handle error in API
    # Assert error in response if handled 