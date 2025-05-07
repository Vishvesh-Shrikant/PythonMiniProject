// context/AuthContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/api";
import { useRouter } from "next/navigation";
import api from "@/services/api"; // Import the api instance
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    // ✅ Ensure Axios picks up the token immediately
                    api.defaults.headers.common[
                        "Authorization"
                    ] = `Bearer ${token}`;

                    const res = await authService.getCurrentUser();
                    setUser(res.data);
                }
            } catch (err) {
                localStorage.removeItem("token");
                setError("Session expired. Please login again.");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    // Register student
    const registerStudent = async (userData) => {
        setLoading(true);
        try {
            const res = await authService.registerStudent(userData);
            localStorage.setItem("token", res.data.access_token);
            const userData = await loadUserProfile();
            if (userData) router.push("/login");
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Register faculty
    const registerFaculty = async (userData) => {
        setLoading(true);
        try {
            const res = await authService.registerFaculty(userData);
            localStorage.setItem("token", res.data.access_token);
            const userData = await loadUserProfile();
            if (userData) router.push("/login");
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        try {
            const res = await authService.login(credentials);

            const token = res.data.access_token; // ✅ correct field

            if (!token) throw new Error("Token missing in response");

            // Store the token
            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const userData = await loadUserProfile();
            if (userData) router.push("/directory");
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const loadUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            console.log("🔑 Retrieved token:", token); // Add this

            if (token) {
                api.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;
                console.log(
                    "🔑 Set token in axios headers:",
                    api.defaults.headers.common["Authorization"]
                ); // Add this
                const res = await authService.getCurrentUser();
                console.log("👤 User profile data:", res.data); // Add this
                setUser(res.data);
                return res.data;
            }
        } catch (err) {
            console.error("🚫 Error loading profile:", err);
            setError("Failed to load user profile");
            throw err;
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                registerStudent,
                registerFaculty,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
