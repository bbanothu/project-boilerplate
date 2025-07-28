import pytest
from unittest.mock import patch
from app.services.llm_service import extract_data_from_document

def test_extract_data_from_document():
    sample_text = 'Shipment ID: 12345, Sender: John Doe'
    with patch('app.services.llm_service.client.messages.create') as mock_create:
        mock_create.return_value = type('MockResponse', (), {'content': [{'text': '{"shipment_id": "12345", "sender_name": "John Doe", "sender_address": "", "receiver_name": "", "receiver_address": "", "items": [], "total_weight": 0, "total_value": 0, "shipment_date": ""}'}]})()
        result = extract_data_from_document(sample_text)
        assert isinstance(result, dict)
        assert result['shipment_id'] == '12345'
        assert result['sender_name'] == 'John Doe' 