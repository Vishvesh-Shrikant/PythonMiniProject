from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

collaboration_bp = Blueprint('collaboration', __name__)

@collaboration_bp.route('/matches', methods=['GET'])
@jwt_required()
def get_matches():
    db = current_app.db
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    user_type = current_user.get('user_type')

    key = 'student_id' if user_type == 'student' else 'faculty_id'
    matches = list(db.collaborations.find({key: user_id}))

    for m in matches:
        m['_id'] = str(m['_id'])
    return jsonify({"success": True, "matches": matches, "count": len(matches)}), 200

@collaboration_bp.route('/matches/<user_id>', methods=['GET'])
@jwt_required()
def get_matches_for_user(user_id):
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    user_type = user.get('user_type')
    key = 'student_id' if user_type == 'student' else 'faculty_id'
    matches = list(db.collaborations.find({key: user_id}))
    for m in matches:
        m['_id'] = str(m['_id'])
    return jsonify({"success": True, "matches": matches, "count": len(matches)}), 200

@collaboration_bp.route('/request', methods=['POST'])
@jwt_required()
def create_collaboration_request():
    db = current_app.db
    current_user = get_jwt_identity()
    user_id = current_user.get('user_id')
    user_type = current_user.get('user_type')

    if user_type != 'student':
        return jsonify({"success": False, "message": "Only students can create collaboration requests"}), 403

    data = request.get_json()
    if not data or 'faculty_id' not in data or 'message' not in data:
        return jsonify({"success": False, "message": "Faculty ID and message are required"}), 400

    request_data = {
        'student_id': user_id,
        'faculty_id': data.get('faculty_id'),
        'message': data.get('message'),
        'research_topic': data.get('research_topic', ''),
        'status': 'pending',
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }

    result = db.collaborations.insert_one(request_data)
    return jsonify({
        "success": True,
        "message": "Collaboration request created successfully",
        "request_id": str(result.inserted_id)
    }), 201

@collaboration_bp.route('/requests/student', methods=['GET'])
@jwt_required()
def get_student_requests():
    db = current_app.db
    current_user = get_jwt_identity()
    if current_user.get('user_type') != 'student':
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    student_id = current_user.get('user_id')
    requests = list(db.collaborations.find({'student_id': student_id}))
    for r in requests:
        r['_id'] = str(r['_id'])
        faculty = db.users.find_one({"_id": ObjectId(r['faculty_id'])})
        if faculty:
            r['faculty'] = {
                'id': str(faculty['_id']),
                'name': faculty.get('name'),
                'department': faculty.get('department', ''),
                'position': faculty.get('position', '')
            }
    return jsonify({"success": True, "requests": requests, "count": len(requests)}), 200

@collaboration_bp.route('/requests/faculty', methods=['GET'])
@jwt_required()
def get_faculty_requests():
    db = current_app.db
    current_user = get_jwt_identity()
    if current_user.get('user_type') != 'faculty':
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    faculty_id = current_user.get('user_id')
    requests = list(db.collaborations.find({'faculty_id': faculty_id}))
    for r in requests:
        r['_id'] = str(r['_id'])
        student = db.users.find_one({"_id": ObjectId(r['student_id'])})
        if student:
            r['student'] = {
                'id': str(student['_id']),
                'name': student.get('name'),
                'department': student.get('department', ''),
                'program': student.get('program', '')
            }
    return jsonify({"success": True, "requests": requests, "count": len(requests)}), 200

@collaboration_bp.route('/request/<request_id>/status', methods=['PUT'])
@jwt_required()
def update_request_status(request_id):
    db = current_app.db
    current_user = get_jwt_identity()
    if current_user.get('user_type') != 'faculty':
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    faculty_id = current_user.get('user_id')
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"success": False, "message": "Status is required"}), 400

    status = data['status']
    if status not in ['pending', 'accepted', 'rejected']:
        return jsonify({"success": False, "message": "Invalid status"}), 400

    request_obj = db.collaborations.find_one({'_id': ObjectId(request_id)})
    if not request_obj:
        return jsonify({"success": False, "message": "Request not found"}), 404

    if request_obj['faculty_id'] != faculty_id:
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    result = db.collaborations.update_one(
        {'_id': ObjectId(request_id)},
        {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
    )

    if result.modified_count == 0:
        return jsonify({"success": False, "message": "Failed to update request status"}), 400

    return jsonify({"success": True, "message": f"Request {status}"}), 200
