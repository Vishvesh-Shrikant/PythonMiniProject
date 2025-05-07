from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.student import Student
from app.models.faculty import Faculty
import re
from email_validator import validate_email, EmailNotValidError

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        identity = get_jwt_identity()
        
        # Check if user is admin
        if identity.get('role') != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def faculty_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        identity = get_jwt_identity()
        
        # Check if user is faculty
        if identity.get('user_type') != 'faculty':
            return jsonify({"msg": "Faculty access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def student_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        identity = get_jwt_identity()
        
        # Check if user is student
        if identity.get('user_type') != 'student':
            return jsonify({"msg": "Student access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def validate_registration_data(data, user_type):
    """Validate registration data"""
    errors = {}
    
    # Required fields for both user types
    required_fields = ['email', 'password', 'name']
    
    # Check required fields
    for field in required_fields:
        if field not in data or not data[field]:
            errors[field] = f"{field} is required"
    
    # Validate email format
    if 'email' in data and data['email']:
        try:
            validate_email(data['email'])
        except EmailNotValidError:
            errors['email'] = "Invalid email format"
    
    # Check if email already exists
    if 'email' in data and data['email'] and 'email' not in errors:
        student = Student.get_student_by_email(data['email'])
        faculty = Faculty.get_faculty_by_email(data['email'])
        
        if student or faculty:
            errors['email'] = "Email already registered"
    
    # Password requirements
    if 'password' in data and data['password']:
        if len(data['password']) < 8:
            errors['password'] = "Password must be at least 8 characters long"
    
    # Validate research interests
    if 'research_interests' in data:
        if not isinstance(data['research_interests'], list):
            errors['research_interests'] = "Research interests must be a list"
    
    return errors