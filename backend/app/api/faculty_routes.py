from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.auth.utils import faculty_required
from bson import ObjectId
from passlib.hash import pbkdf2_sha256

faculty_bp = Blueprint('faculty', __name__)

@faculty_bp.route('/faculty', methods=['GET'])
def get_all_faculty():
    """Get all faculty members"""
    db = current_app.db
    filters = {"user_type": "faculty"}

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

    faculty_list = list(db.users.find(filters))
    for faculty in faculty_list:
        faculty["_id"] = str(faculty["_id"])
        faculty.pop("password", None)

    return jsonify({
        "success": True,
        "faculty": faculty_list,
        "count": len(faculty_list)
    }), 200


@faculty_bp.route('/faculty/<faculty_id>', methods=['GET'])
def get_faculty(faculty_id):
    """Get faculty by ID"""
    db = current_app.db
    if not ObjectId.is_valid(faculty_id):
        return jsonify({"success": False, "message": "Invalid faculty ID"}), 400

    faculty = db.users.find_one({"_id": ObjectId(faculty_id), "user_type": "faculty"})
    if not faculty:
        return jsonify({"success": False, "message": "Faculty not found"}), 404

    faculty["_id"] = str(faculty["_id"])
    faculty.pop("password", None)

    return jsonify({
        "success": True,
        "faculty": faculty
    }), 200


@faculty_bp.route('/faculty/<faculty_id>', methods=['PUT'])
@jwt_required()
def update_faculty(faculty_id):
    """Update faculty profile - only the faculty owner can update their profile"""
    db = current_app.db
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    user_type = current_user.get('user_type')

    if user_id != faculty_id or user_type != 'faculty':
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    if not ObjectId.is_valid(faculty_id):
        return jsonify({"success": False, "message": "Invalid faculty ID"}), 400

    update_data = request.get_json()
    if not update_data:
        return jsonify({"success": False, "message": "No data provided"}), 400

    update_data.pop('email', None)
    update_data.pop('user_type', None)
    if 'password' in update_data:
        update_data['password'] = pbkdf2_sha256.hash(update_data['password'])

    result = db.users.update_one(
        {"_id": ObjectId(faculty_id), "user_type": "faculty"},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        return jsonify({"success": False, "message": "Failed to update faculty"}), 400

    return jsonify({
        "success": True,
        "message": "Faculty updated successfully"
    }), 200


@faculty_bp.route('/departments', methods=['GET'])
def get_departments():
    """Get unique departments"""
    db = current_app.db
    departments = db.users.distinct("department", {"user_type": "faculty"})
    departments = [d for d in departments if d]

    return jsonify({
        "success": True,
        "departments": sorted(departments)
    }), 200
