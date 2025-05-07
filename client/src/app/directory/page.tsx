"use client";

import type { Faculty } from "@/types/user";
import type { Student } from "@/types/user";
import { useEffect, useState, useMemo, useCallback } from "react";
// Import API functions
import { facultyService } from "@/services/api";
import { studentService } from "@/services/api";

import UserProfileCard from "@/components/user-profile-card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { debounce } from "lodash";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type User = Faculty | Student;

const ALL_DEPARTMENTS_VALUE = "all_departments"; // Use a distinct value
const ALL_RESEARCH_AREAS_VALUE = "all_research_areas"; // Use a distinct value

export default function DirectoryPage() {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string>(
        ALL_DEPARTMENTS_VALUE
    );
    const [researchAreaFilter, setResearchAreaFilter] = useState<string>(
        ALL_RESEARCH_AREAS_VALUE
    );
    const [userTypeFilter, setUserTypeFilter] = useState<
        "all" | "faculty" | "student"
    >("all");

    // Fetch data callback
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null); // Reset error state
        try {
            // Fetch data from API
            const [facultyResponse, studentsResponse] = await Promise.all([
                facultyService.getAllFaculty(),
                studentService.getAllStudents(),
            ]);
            const faculty = facultyResponse.data.faculty;
            const students = studentsResponse.data.students;

            const combinedUsers = [...faculty, ...students].filter(Boolean); // Filter out any potential null/undefined entries
            setAllUsers(combinedUsers);
            console.log("Fetched users:", combinedUsers); // Log the fetched users
            setFilteredUsers(combinedUsers); // Initially show all users
        } catch (err) {
            console.error("Error fetching user data from API:", err);
            const message =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred.";
            // Provide a more specific error message if it's a network error
            if (message.includes("Network error")) {
                setError(
                    `Failed to connect to the backend API. Please ensure the Flask server (app.py) is running and accessible at. Details: ${message}`
                );
            } else {
                setError(
                    `Failed to load user data: ${message}. Please try refreshing the page.`
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array, fetchData's identity is stable

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Run fetchData on initial mount

    const departments = useMemo(() => {
        const uniqueDepartments = new Set(
            allUsers.map((user) => user?.department).filter(Boolean)
        );
        // Add "All Departments" option first
        return [ALL_DEPARTMENTS_VALUE, ...Array.from(uniqueDepartments).sort()];
    }, [allUsers]);

    const researchAreas = useMemo(() => {
        const allAreas = new Set(
            allUsers.flatMap((user) => user?.research_interests).filter(Boolean)
        );
        // Add "All Research Areas" option first
        return [ALL_RESEARCH_AREAS_VALUE, ...Array.from(allAreas).sort()];
    }, [allUsers]);

    const filterUsersCallback = useCallback(() => {
        if (isLoading) return; // Don't filter while loading initial data

        let users = allUsers;

        // Filter by User Type
        if (userTypeFilter !== "all") {
            users = users.filter((user) => user?.user_type === userTypeFilter);
        }

        // Filter by Department
        if (departmentFilter !== ALL_DEPARTMENTS_VALUE) {
            users = users.filter(
                (user) => user?.department === departmentFilter
            );
        }

        // Filter by Research Area
        if (
            researchAreaFilter &&
            researchAreaFilter !== ALL_RESEARCH_AREAS_VALUE
        ) {
            // Ensure researchInterests is an array before checking includes
            users = users.filter(
                (user) =>
                    Array.isArray(user?.research_interests) &&
                    user.research_interests.includes(researchAreaFilter)
            );
        }

        // Filter by Search Term (Name, Bio, Keywords, Title, Department)
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            users = users.filter(
                (user) =>
                    user?.name?.toLowerCase().includes(lowerSearchTerm) ||
                    user?.bio?.toLowerCase().includes(lowerSearchTerm) ||
                    (Array.isArray(user?.research_interests) &&
                        user.research_interests.some((interest: string) =>
                            interest?.toLowerCase().includes(lowerSearchTerm)
                        )) ||
                    user?.department?.toLowerCase().includes(lowerSearchTerm)
            );
        }

        setFilteredUsers(users);
    }, [
        allUsers,
        searchTerm,
        departmentFilter,
        researchAreaFilter,
        userTypeFilter,
        isLoading,
    ]);

    const debouncedFilter = useMemo(
        () => debounce(filterUsersCallback, 300),
        [filterUsersCallback]
    );

    useEffect(() => {
        debouncedFilter();
        // Cleanup the debounced function on unmount
        return () => debouncedFilter.cancel();
    }, [
        searchTerm,
        departmentFilter,
        researchAreaFilter,
        userTypeFilter,
        debouncedFilter,
    ]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">
                User Directory
            </h1>
            <p className="text-muted-foreground">
                Find faculty and students based on department, research
                interests, or keywords.
            </p>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Users</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button
                        onClick={fetchData}
                        className="mt-4 w-20 p-2"
                    >
                        {" "}
                        {/* Changed to call fetchData */}
                        Try Again
                    </Button>
                </Alert>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-card shadow">
                <Input
                    placeholder="Search by name, keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="lg:col-span-2"
                    aria-label="Search directory"
                    disabled={isLoading || !!error} // Disable if loading or error
                />
                <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                    disabled={isLoading || !!error}
                >
                    <SelectTrigger aria-label="Filter by Department">
                        <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map((dept) => (
                            // Use a non-empty, unique value for SelectItem, fallback for undefined/null dept names
                            <SelectItem
                                key={dept || "unknown_dept"}
                                value={dept || "unknown_dept"}
                            >
                                {dept === ALL_DEPARTMENTS_VALUE
                                    ? "All Departments"
                                    : dept || "Unknown"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={researchAreaFilter}
                    onValueChange={setResearchAreaFilter}
                    disabled={isLoading || !!error}
                >
                    <SelectTrigger aria-label="Filter by Research Area">
                        <SelectValue placeholder="Filter by Research Area" />
                    </SelectTrigger>
                    <SelectContent>
                        {researchAreas.map((area) => (
                            // Use a non-empty, unique value for SelectItem, fallback for undefined/null area names
                            <SelectItem
                                key={area || "unknown_area"}
                                value={area || "unknown_area"}
                            >
                                {area === ALL_RESEARCH_AREAS_VALUE
                                    ? "All Research Areas"
                                    : area || "Unknown"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* User Type Tabs */}
            <Tabs
                value={userTypeFilter}
                onValueChange={(value: string) =>
                    setUserTypeFilter(value as "all" | "faculty" | "student")
                }
            >
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger
                        value="all"
                        disabled={isLoading || !!error}
                    >
                        All
                    </TabsTrigger>
                    <TabsTrigger
                        value="faculty"
                        disabled={isLoading || !!error}
                    >
                        Faculty
                    </TabsTrigger>
                    <TabsTrigger
                        value="student"
                        disabled={isLoading || !!error}
                    >
                        Students
                    </TabsTrigger>
                </TabsList>
                {/* Content for each tab is handled by filtering */}
            </Tabs>

            {/* User List Area */}

            {
                isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            // Use UserProfileCard with undefined user for skeleton state
                            <UserProfileCard
                                key={`skeleton-${i}`}
                                user={undefined}
                            />
                        ))}
                    </div>
                ) : !error && filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user) =>
                        {
                            console.log(user._id)
                            console.log(user.user_type)
                            console.log(user)
                            return(
                                user && user._id ? (
                                    <UserProfileCard
                                        key={user._id}
                                        user={user}
                                    />
                                ) : null
                            )
                        }
                            // Ensure user object is valid before passing
                        )}
                    </div>
                ) : !error ? ( // Only show "No Users Found" if there's no error
                    <Alert className="text-center">
                        <Search className="h-4 w-4 mx-auto mb-2" />
                        <AlertTitle>No Users Found</AlertTitle>
                        <AlertDescription>
                            No users match your current filters. Try adjusting
                            your search or filter criteria.
                        </AlertDescription>
                    </Alert>
                ) : null /* Error case handled above */
            }
        </div>
    );
}
