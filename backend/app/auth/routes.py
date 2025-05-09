# from flask import Blueprint, request, jsonify
# from app.models.student import Student
# from app.models.faculty import Faculty
# from app.auth.utils import validate_registration_data
# from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
# from passlib.hash import pbkdf2_sha256

# auth = Blueprint('auth', __name__)

# @auth.route('/register/student', methods=['POST'])
# def register_student():
#     """Register a new student"""
#     data = request.get_json()
#     # Validate data
#     errors = validate_registration_data(data, 'student')
#     if errors:
#         return jsonify({"success": False, "errors": errors}), 400
    
#     # Create student
#     student_id = Student.create_student(data)
    
#     return jsonify({
#         "success": True,
#         "message": "Student registered successfully", 
#         "student_id": student_id
#     }), 201

# @auth.route('/register/faculty', methods=['POST'])
# def register_faculty():
#     """Register a new faculty member"""
#     data = request.get_json()
    
#     # Validate data
#     errors = validate_registration_data(data, 'faculty')
#     if errors:
#         return jsonify({"success": False, "errors": errors}), 400
    
#     # Create faculty
#     faculty_id = Faculty.create_faculty(data)
    
#     return jsonify({
#         "success": True,
#         "message": "Faculty registered successfully", 
#         "faculty_id": faculty_id
#     }), 201

# @auth.route('/login', methods=['POST'])
# def login():
#     """Login for students and faculty"""
#     data = request.get_json()
    
#     if not data or 'email' not in data or 'password' not in data:
#         return jsonify({"success": False, "message": "Email and password required"}), 400
    
#     email = data['email'].lower()
#     password = data['password']
    
#     # Check if user exists
#     student = Student.get_student_by_email(email)
#     faculty = Faculty.get_faculty_by_email(email)
    
#     user = student or faculty
    
#     if not user:
#         return jsonify({"success": False, "message": "Invalid email or password"}), 401
    
#     # Check password
#     if not pbkdf2_sha256.verify(password, user['password']):
#         return jsonify({"success": False, "message": "Invalid email or password"}), 401
    
#     # Convert MongoDB ObjectId to string - this is the critical fix
#     user_id = str(user["_id"])
    
#     # Create tokens with string ID
#     user_identity = {
#         "user_id": user_id,
#         "email": user["email"],
#         "user_type": user["user_type"]
#     }
    
#     access_token = create_access_token(identity=user_identity)
#     refresh_token = create_refresh_token(identity=user_identity)

#     return jsonify({
#         "success": True,
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "user": {
#             "id": user_id,
#             "name": user["name"],
#             "email": user["email"],
#             "user_type": user["user_type"]
#         }
#     }), 200
    
# @auth.route('/refresh', methods=['POST'])
# @jwt_required(refresh=True)
# def refresh():
#     """Refresh access token"""
#     current_user = get_jwt_identity()
#     access_token = create_access_token(identity=current_user)
    
#     return jsonify({
#         "success": True,
#         "access_token": access_token
#     }), 200

# # @auth.route('/me', methods=['GET'])
# # @jwt_required()
# # def get_user_profile():
# #     """Get current user profile"""
# #     current_user = get_jwt_identity()

# #     print('DEBUG: current_user from JWT =', current_user)
    
# #     # The current_user should now be a dictionary with string user_id
# #     user_id = current_user.get('sub.user_id')
# #     user_type = current_user.get('sub.user_type')
    
# #     if not user_id or not user_type:
# #         return jsonify({"success": False, "message": "Invalid token content"}), 422

# #     if user_type == 'student':
# #         # Make sure your get_student_by_id can handle string IDs
# #         user = Student.get_student_by_id(user_id)
# #     else:
# #         # Make sure your get_faculty_by_id can handle string IDs
# #         user = Faculty.get_faculty_by_id(user_id)

# #     if not user:
# #         return jsonify({"success": False, "message": "User not found"}), 404

# #     # Remove password from response
# #     user.pop('password', None)

# #     return jsonify({
# #         "success": True,
# #         "user": user
# #     }), 200
# @auth.route('/me', methods=['GET'])
# @jwt_required()
# def get_user_profile():
#     """Get current user profile"""
#     current_user = get_jwt_identity()

#     print('DEBUG: current_user from JWT =', current_user)

#     # Extract 'sub' first
#     sub = current_user.get('sub', {})
#     user_id = sub.get('user_id')
#     user_type = sub.get('user_type')

#     if not user_id or not user_type:
#         return jsonify({"success": False, "message": "Invalid token content"}), 422

#     if user_type == 'student':
#         user = Student.get_student_by_id(user_id)
#     else:
#         user = Faculty.get_faculty_by_id(user_id)

#     if not user:
#         return jsonify({"success": False, "message": "User not found"}), 404

#     user.pop('password', None)

#     return jsonify({
#         "success": True,
#         "user": user
#     }), 200
from flask import Blueprint, request, jsonify
from app.models.student import Student
from app.models.faculty import Faculty
from app.auth.utils import validate_registration_data
from flask_jwt_extended import (
    create_access_token, create_refresh_token, get_jwt, jwt_required, get_jwt_identity
)
from passlib.hash import pbkdf2_sha256

auth = Blueprint('auth', __name__)

@auth.route('/register/student', methods=['POST'])
def register_student():
    """Register a new student"""
    data = request.get_json()
    errors = validate_registration_data(data, 'student')
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    access_token = create_access_token(identity=data.email, additional_claims={
        "email": data.email,
        "user_type": data.user_type
    })
    student_id = Student.create_student(data)
    return jsonify({
        "success": True,
        "message": "Student registered successfully", 
        "student_id": student_id,
        "accessToken": access_token
    }), 201

@auth.route('/register/faculty', methods=['POST'])
def register_faculty():
    """Register a new faculty member"""
    data = request.get_json()
    errors = validate_registration_data(data, 'faculty')
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    access_token = create_access_token(identity=data.email, additional_claims={
        "email": data.email,
        "user_type": data.user_type
        
    })
    
    faculty_id = Faculty.create_faculty(data)
    return jsonify({
        "success": True,
        "message": "Faculty registered successfully", 
        "faculty_id": faculty_id,
        "accessToken": access_token
    }), 201


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"success": False, "message": "Email and password required"}), 400

    email = data['email'].lower()
    password = data['password']

    student = Student.get_student_by_email(email)
    faculty = Faculty.get_faculty_by_email(email)

    user = student or faculty

    if not user:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    if not pbkdf2_sha256.verify(password, user['password']):
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    user_id = str(user["_id"])

    # 🚀 FLAT DICT — DO NOT WRAP IN "sub"
    access_token = create_access_token(identity=user_id, additional_claims={
    "email": user["email"],
    "user_type": user["user_type"]
})
    refresh_token = create_access_token(identity=user_id, additional_claims={
    "email": user["email"],
    "user_type": user["user_type"]
})

    return jsonify({
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "user_type": user["user_type"]
        }
    }), 200



@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    
    return jsonify({
        "success": True,
        "access_token": access_token
    }), 200

@auth.route('/me', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()   # string user_id
    claims = get_jwt()
    user_type = claims.get('user_type')

    print('DEBUG: current_user_id =', current_user_id)
    print('DEBUG: user_type =', user_type)

    if not current_user_id or not user_type:
        return jsonify({"success": False, "message": "Invalid token content"}), 422

    if user_type == 'student':
        user = Student.get_student_by_id(current_user_id)
    else:
        user = Faculty.get_faculty_by_id(current_user_id)

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user.pop('password', None)

    return jsonify({
        "success": True,
        "user": user
    }), 200
