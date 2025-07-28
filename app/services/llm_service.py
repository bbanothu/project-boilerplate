from anthropic import Anthropic
from app.core.config import settings
import json
import re

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def extract_data_from_document(document_text: str) -> dict:
    """
    Use Anthropic LLM to extract structured data from document text.

    Args:
        document_text: Text from the documents

    Returns:
        dict: Extracted fields
    """

    schema = """
{
  "shipment_id": "string",
  "sender_name": "string",
  "sender_address": "string",
  "receiver_name": "string",
  "receiver_address": "string",
  "items": [{"description": "string", "quantity": "number", "weight": "number", "value": "number"}],
  "total_weight": "number",
  "total_value": "number",
  "shipment_date": "string"
}
"""

    system_prompt = "You are a helpful assistant that extracts structured data from shipment documents accurately. Output only valid JSON matching the schema."

    user_prompt = f"Extract the data to JSON following this schema: {schema}\n\nDocument text:\n{document_text}"

    response = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )

    # Extract the text
    extracted_text = response.content[0].text

    # Strip any markdown
    extracted_text = re.sub(r'^```json\n|```$', '', extracted_text.strip())

    try:
        extracted_data = json.loads(extracted_text)
    except json.JSONDecodeError:
        extracted_data = {"error": "Failed to parse JSON from LLM response"}

    return extracted_data
