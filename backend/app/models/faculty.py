from flask import current_app
from bson import ObjectId
from datetime import datetime
from passlib.hash import pbkdf2_sha256

class Faculty:
    """Faculty model for MongoDB using pymongo"""
    
    @staticmethod
    def create_faculty(user_data):
        """Create a new faculty document"""
        db = current_app.db
        faculty = {
            "email": user_data.get('email').lower(),
            "password": pbkdf2_sha256.hash(user_data.get('password')),
            "name": user_data.get('name'),
            "user_type": "faculty",
            "profile_image": user_data.get('profile_image', ''),
            "department": user_data.get('department', ''),
            "position": user_data.get('position', ''),
            "research_interests": user_data.get('research_interests', []),
            "bio": user_data.get('bio', ''),
            "publications": user_data.get('publications', []),
            "current_projects": user_data.get('current_projects', []),
            "lab_info": user_data.get('lab_info', {}),
            "availability": user_data.get('availability', ''),
            "contact_info": user_data.get('contact_info', {}),
            "office_hours": user_data.get('office_hours', ''),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = db.users.insert_one(faculty)
        return str(result.inserted_id)

    @staticmethod
    def get_faculty_by_id(faculty_id):
        """Get faculty by ID"""
        db = current_app.db
        if not ObjectId.is_valid(faculty_id):
            return None

        faculty = db.users.find_one({"_id": ObjectId(faculty_id), "user_type": "faculty"})
        if faculty:
            faculty["_id"] = str(faculty["_id"])
        return faculty

    @staticmethod
    def get_faculty_by_email(email):
        """Get faculty by email"""
        db = current_app.db
        faculty = db.users.find_one({"email": email.lower(), "user_type": "faculty"})
        if faculty:
            faculty["_id"] = str(faculty["_id"])
        return faculty

    @staticmethod
    def get_all_faculty(filters=None):
        """Get all faculty with optional filters"""
        db = current_app.db
        query = {"user_type": "faculty"}

        if filters:
            if 'department' in filters and filters['department']:
                query['department'] = filters['department']
            if 'research_interests' in filters and filters['research_interests']:
                query['research_interests'] = {"$in": filters['research_interests']}
            if 'search' in filters and filters['search']:
                search_term = filters['search']
                query['$or'] = [
                    {"name": {"$regex": search_term, "$options": "i"}},
                    {"bio": {"$regex": search_term, "$options": "i"}},
                    {"research_interests": {"$regex": search_term, "$options": "i"}}
                ]

        faculty = list(db.users.find(query))
        for faculty_member in faculty:
            faculty_member["_id"] = str(faculty_member["_id"])
        return faculty

    @staticmethod
    def update_faculty(faculty_id, update_data):
        """Update faculty profile"""
        db = current_app.db
        if not ObjectId.is_valid(faculty_id):
            return False

        # Do not allow email or user_type to be changed
        update_data.pop('email', None)
        update_data.pop('user_type', None)
        if 'password' in update_data:
            update_data['password'] = pbkdf2_sha256.hash(update_data['password'])

        update_data['updated_at'] = datetime.utcnow()

        result = db.users.update_one(
            {"_id": ObjectId(faculty_id), "user_type": "faculty"},
            {"$set": update_data}
        )
        return result.modified_count > 0
