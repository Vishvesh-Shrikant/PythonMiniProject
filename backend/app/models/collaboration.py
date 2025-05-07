from flask import current_app
from bson import ObjectId
from datetime import datetime

class Collaboration:
    """Collaboration model for MongoDB using pymongo"""

    @staticmethod
    def create_request(data):
        """Create a new collaboration request"""
        db = current_app.db
        collab_request = {
            "student_id": data.get('student_id'),
            "faculty_id": data.get('faculty_id'),
            "message": data.get('message', ''),
            "research_topic": data.get('research_topic', ''),
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = db.collaboration_requests.insert_one(collab_request)
        return str(result.inserted_id)

    @staticmethod
    def get_request_by_id(request_id):
        """Get collaboration request by ID"""
        db = current_app.db
        if not ObjectId.is_valid(request_id):
            return None

        request = db.collaboration_requests.find_one({"_id": ObjectId(request_id)})
        if request:
            request["_id"] = str(request["_id"])
        return request

    @staticmethod
    def get_requests_for_student(student_id):
        """Get all collaboration requests for a student"""
        db = current_app.db
        if not ObjectId.is_valid(student_id):
            return []

        requests = list(db.collaboration_requests.find({"student_id": student_id}))
        for request in requests:
            request["_id"] = str(request["_id"])
        return requests

    @staticmethod
    def get_requests_for_faculty(faculty_id):
        """Get all collaboration requests for a faculty member"""
        db = current_app.db
        if not ObjectId.is_valid(faculty_id):
            return []

        requests = list(db.collaboration_requests.find({"faculty_id": faculty_id}))
        for request in requests:
            request["_id"] = str(request["_id"])
        return requests

    @staticmethod
    def update_request_status(request_id, status):
        """Update status of a collaboration request"""
        db = current_app.db
        if not ObjectId.is_valid(request_id):
            return False

        result = db.collaboration_requests.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    @staticmethod
    def find_matches(user_id, user_type):
        """Find matches for a user based on research interests"""
        db = current_app.db
        if not ObjectId.is_valid(user_id):
            return []

        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "research_interests" not in user:
            return []

        research_interests = user.get("research_interests", [])
        if not research_interests:
            return []

        match_query = {
            "user_type": "faculty" if user_type == "student" else "student",
            "research_interests": {"$in": research_interests}
        }

        matches = list(db.users.find(match_query))
        for match in matches:
            match["_id"] = str(match["_id"])
            match_interests = set(match.get("research_interests", []))
            common_interests = match_interests.intersection(set(research_interests))
            match["match_score"] = len(common_interests)
            match["common_interests"] = list(common_interests)

        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches
