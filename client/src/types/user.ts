export interface Faculty {
    _id: string; // Combined ID like 'faculty-1' from the API
    name: string;
    email: string;
    profile_image: string;
    position: string;
    department: string;
    research_interests: string[]; // Stored as comma-separated string in DB, converted in API
    contact_info: string;
    bio: string;
    publications: string[]; // Stored as comma-separated string in DB, converted in API
    current_projects: string[]; // Stored as comma-separated string in DB, converted in API
    availability: string;
    collaboration_status?: string | null;
    user_type: "faculty";
}
export interface Student {
    _id: string; // Combined ID like 'student-101' from the API
    name: string;
    email: string;
    profile_image: string;
    title: string;
    department: string;
    research_interests: string[]; // Stored as comma-separated string in DB, converted in API
    contact_info: string;
    bio: string;
    program: string;
    current_projects: string[];
    skills: string[];
    publications: string[]; // Stored as comma-separated string in DB, converted in API
    availability: string;
    year_of_study: string;
    collaboration_status?: string | null;
    user_type: "student";
}

export type User = Faculty | Student;
