from bson import ObjectId
import json
import re

class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for MongoDB ObjectId"""
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

def convert_object_ids(data):
    """Convert ObjectIds to strings in a dictionary or list"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, ObjectId):
                data[key] = str(value)
            elif isinstance(value, dict) or isinstance(value, list):
                data[key] = convert_object_ids(value)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, ObjectId):
                data[i] = str(item)
            elif isinstance(item, dict) or isinstance(item, list):
                data[i] = convert_object_ids(item)
    return data

def sanitize_input(text):
    """Remove potentially harmful characters from input"""
    if not text:
        return text
    
    # Remove script tags
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL)
    
    # Remove other potentially harmful HTML tags
    text = re.sub(r'<.*?>', '', text)
    
    return text