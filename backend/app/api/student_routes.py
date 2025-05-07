from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from passlib.hash import pbkdf2_sha256

student_bp = Blueprint('student', __name__)

@student_bp.route('/students', methods=['GET'])
def get_all_students():
    """Get all students"""
    db = current_app.db
    filters = {"user_type": "student"}

    if request.args.get('department'):
        filters['department'] = request.args.get('department')

    if request.args.get('research_interests'):
        filters['research_interests'] = {
            "$in": request.args.get('research_interests').split(',')
        }

    if request.args.get('search'):
        search_term = request.args.get('search')
        filters['$or'] = [
            {"name": {"$regex": search_term, "$options": "i"}},
            {"bio": {"$regex": search_term, "$options": "i"}},
            {"research_interests": {"$regex": search_term, "$options": "i"}},
        ]

    students = list(db.users.find(filters))
    for student in students:
        student["_id"] = str(student["_id"])
        student.pop("password", None)

    return jsonify({
        "success": True,
        "students": students,
        "count": len(students)
    }), 200


@student_bp.route('/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get student by ID"""
    db = current_app.db
    if not ObjectId.is_valid(student_id):
        return jsonify({"success": False, "message": "Invalid student ID"}), 400

    student = db.users.find_one({"_id": ObjectId(student_id), "user_type": "student"})
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404

    student["_id"] = str(student["_id"])
    student.pop("password", None)

    return jsonify({
        "success": True,
        "student": student
    }), 200


@student_bp.route('/students/<student_id>', methods=['PUT'])
@jwt_required()
def update_student(student_id):
    """Update student profile - only the student owner can update their profile"""
    db = current_app.db
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    user_type = current_user.get('user_type')

    if user_id != student_id or user_type != 'student':
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    if not ObjectId.is_valid(student_id):
        return jsonify({"success": False, "message": "Invalid student ID"}), 400

    update_data = request.get_json()
    if not update_data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    update_data.pop('email', None)
    update_data.pop('user_type', None)
    if 'password' in update_data:
        update_data['password'] = pbkdf2_sha256.hash(update_data['password'])

    result = db.users.update_one(
        {"_id": ObjectId(student_id), "user_type": "student"},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        return jsonify({"success": False, "message": "Failed to update student"}), 400

    return jsonify({
        "success": True,
        "message": "Student updated successfully"
    }), 200


@student_bp.route('/programs', methods=['GET'])
def get_programs():
    """Get unique programs"""
    db = current_app.db
    programs = db.users.distinct("program", {"user_type": "student"})
    programs = [p for p in programs if p]

    return jsonify({
        "success": True,
        "programs": sorted(programs)
    }), 200


@student_bp.route('/research-interests', methods=['GET'])
def get_research_interests():
    """Get unique research interests from all users"""
    db = current_app.db

    student_interests = db.users.distinct("research_interests", {"user_type": "student"})
    faculty_interests = db.users.distinct("research_interests", {"user_type": "faculty"})

    all_interests = set(student_interests + faculty_interests)
    all_interests = [i for i in all_interests if i]

    return jsonify({
        "success": True,
        "research_interests": sorted(all_interests)
    }), 200
