from flask import current_app
from bson import ObjectId
from datetime import datetime
from passlib.hash import pbkdf2_sha256

class Student:
    """Student model for MongoDB using pymongo directly"""

    @staticmethod
    def create_student(user_data):
        """Create a new student document"""
        db = current_app.db
        student = {
            "email": user_data.get('email').lower(),
            "password": pbkdf2_sha256.hash(user_data.get('password')),
            "name": user_data.get('name'),
            "user_type": "student",
            "profile_image": user_data.get('profile_image', ''),
            "department": user_data.get('department', ''),
            "year_of_study": user_data.get('year_of_study', ''),
            "program": user_data.get('program', ''),
            "research_interests": user_data.get('research_interests', []),
            "bio": user_data.get('bio', ''),
            "publications": user_data.get('publications', []),
            "current_projects": user_data.get('current_projects', []),
            "skills": user_data.get('skills', []),
            "availability": user_data.get('availability', ''),
            "contact_info": user_data.get('contact_info', {}),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = db.users.insert_one(student)
        return str(result.inserted_id)

    @staticmethod
    def get_student_by_id(student_id):
        """Get student by ID"""
        db = current_app.db
        if not ObjectId.is_valid(student_id):
            return None

        student = db.users.find_one({"_id": ObjectId(student_id), "user_type": "student"})
        if student:
            student["_id"] = str(student["_id"])
        return student

    @staticmethod
    def get_student_by_email(email):
        """Get student by email"""
        db = current_app.db
        student = db.users.find_one({"email": email.lower(), "user_type": "student"})
        if student:
            student["_id"] = str(student["_id"])
        return student

    @staticmethod
    def get_all_students(filters=None):
        """Get all students with optional filters"""
        db = current_app.db
        query = {"user_type": "student"}

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

        students = list(db.users.find(query))
        for student in students:
            student["_id"] = str(student["_id"])
        return students

    @staticmethod
    def update_student(student_id, update_data):
        """Update student profile"""
        db = current_app.db
        if not ObjectId.is_valid(student_id):
            return False

        # Prevent modification of certain fields
        update_data.pop('email', None)
        update_data.pop('user_type', None)
        if 'password' in update_data:
            update_data['password'] = pbkdf2_sha256.hash(update_data['password'])

        update_data['updated_at'] = datetime.utcnow()

        result = db.users.update_one(
            {"_id": ObjectId(student_id), "user_type": "student"},
            {"$set": update_data}
        )
        return result.modified_count > 0
