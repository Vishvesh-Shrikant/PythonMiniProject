// services/api.js
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// api.interceptors.request.use((config) => {
//   if (typeof window !== 'undefined') {
//     let token = Cookies.get('token');

//     // Fallback to localStorage if token is not valid
//     if (!token || token === 'undefined') {
//       token = localStorage.getItem('token');
//     }

//     if (token && token !== 'undefined') {
//       config.headers.Authorization = `Bearer ${token}`;
//     } else {
//       // Clean up: remove invalid token from storage
//       localStorage.removeItem('token');
//       Cookies.remove('token');
//       delete config.headers.Authorization;
//     }
//   }

//   return config;
// });
api.interceptors.request.use((config) => {
    let token;

    if (typeof window !== "undefined") {
        token = Cookies.get("token") || localStorage.getItem("token"); // ✅ fallback
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Auth Services
export const authService = {
    registerStudent: (data) => api.post("/auth/register/student", data),
    registerFaculty: (data) => api.post("/auth/register/faculty", data),
    login: (data) => api.post("/auth/login", data),
    getCurrentUser: () => api.get("/auth/me"),
};

// Student Services
export const studentService = {
    getAllStudents: () => api.get("/students"),
    getStudentById: (studentId) => api.get(`/students/${studentId}`),
    updateStudent: (studentId, data) => api.put(`/students/${studentId}`, data),
    getPrograms: () => api.get("/programs"),
    getResearchInterests: () => api.get("/research-interests"),
};

// Faculty Services
export const facultyService = {
    getAllFaculty: () => api.get("/faculty" ),
    getFacultyById: (id) => api.get(`/faculty/${id}`),
    getFacultyByDepartment: (department) =>
        api.get("/faculty", { params: { department } }),
    getFacultyByResearchInterests: (interestsArray) =>
        api.get("/faculty", { params: { research_interests: interestsArray.join(",") } }),
    searchFaculty: (searchTerm) =>
        api.get("/faculty", { params: { search: searchTerm } }),
    getDepartments: () => api.get("/departments"),
    updateFaculty: (id, data) => api.put(`/faculty/${id}`, data),
};


// Collaboration Services
export const collaborationService = {
    getMatches: () => api.get("/matches"),
    getMatchesForUser: (userId) => api.get(`/matches/${userId}`),
    createRequest: (data) => api.post("/request", data),
    getStudentRequests: () => api.get("/requests/student"),
    getFacultyRequests: () => api.get("/requests/faculty"),
    updateRequestStatus: (requestId, status) =>
        api.put(`/request/${requestId}/status`, { status }),
};


export default api;
