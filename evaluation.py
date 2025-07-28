import json
import requests
from pathlib import Path
from tabulate import tabulate

def evaluate_results(expected, actual):
    """
    Calculate accuracy metrics for extracted data.
    """
    metrics = []
    total_fields = 0
    correct_fields = 0

    for field in expected:
        total_fields += 1
        match = field in actual and expected[field] == actual[field]
        metrics.append([field, expected[field], actual.get(field, 'Missing'), match])
        if match:
            correct_fields += 1

    accuracy = correct_fields / total_fields if total_fields > 0 else 0

    # Simple precision/recall assuming all fields are required
    precision = correct_fields / len(actual) if len(actual) > 0 else 0
    recall = correct_fields / len(expected) if len(expected) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'details': metrics
    }

def main():
    # Mock ground truth (based on sample documents)
    ground_truth = {
        "shipment_id": "COSU534343282",
        "sender_name": "Sample Sender",
        "sender_address": "123 Sender St",
        "receiver_name": "Sample Receiver",
        "receiver_address": "456 Receiver Ave",
        "items": [{"description": "Item1", "quantity": 10, "weight": 5, "value": 100}],
        "total_weight": 50,
        "total_value": 1000,
        "shipment_date": "2023-01-01"
    }

    # Mock actual extraction (in real scenario, call the extraction function)
    actual = {
        "shipment_id": "COSU534343282",
        "sender_name": "Sample Sender",
        "sender_address": "123 Sender St",
        "receiver_name": "Sample Receiver",
        "receiver_address": "456 Receiver Ave",
        "items": [{"description": "Item1", "quantity": 10, "weight": 5, "value": 100}],
        "total_weight": 50,
        "total_value": 1000,
        "shipment_date": "2023-01-01"
    }

    results = evaluate_results(ground_truth, actual)

    print("Detailed Field Matches:")
    print(tabulate(results['details'], headers=['Field', 'Expected', 'Actual', 'Match']))

    print("\nOverall Metrics:")
    metrics_table = [
        ['Accuracy', f"{results['accuracy']:.2%}"],
        ['Precision', f"{results['precision']:.2%}"],
        ['Recall', f"{results['recall']:.2%}"],
        ['F1 Score', f"{results['f1']:.2%}"]
    ]
    print(tabulate(metrics_table, headers=['Metric', 'Value']))

if __name__ == "__main__":
    main()