import Link from "next/link";
import Image from "next/image";
import type { User } from "@/types/user"; // Use shared User type
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Briefcase,
    GraduationCap,
    CheckCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileCardProps {
    user: User | null | undefined; // Allow user to be null or undefined for skeleton state
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
    // Render skeleton if user data is not available (loading state)
    if (!user) {
        return (
            <Card className="flex flex-col h-full shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-3 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex flex-wrap gap-1 pt-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-32" />
                </CardFooter>
            </Card>
        );
    }

    // --- User data is available, render the actual card ---

    const isFaculty = user.user_type === "faculty";

    // Ensure bio exists before processing
    const bioText = user.bio || "No bio provided.";
    const truncatedBio =
        bioText.length > 100 ? bioText.substring(0, 100) + "..." : bioText;

    // Ensure researchInterests is an array
    const interests = Array.isArray(user.research_interests)
        ? user.research_interests
        : [];

    // Determine image source with fallback
    // Use a default image if photoUrl is missing or invalid
    const imageSrc =`https://picsum.photos/seed/${user.user_type}${user._id.split("-")[1]}/64/64`;

    // Get collaboration status display
    const getCollaborationStatusDisplay = (
        status: string | null | undefined
    ) => {
        if (!status)
            return {
                text: "Not Specified",
                colorClass: "bg-gray-400 dark:bg-gray-600",
                icon: null,
            };
        switch (status) {
            case "Open to Collaboration":
            case "Seeking Collaborations":
            case "Seeking Project Partners":
                return {
                    text: status,
                    colorClass: "bg-green-500 dark:bg-green-600",
                    icon: <CheckCircle className="w-3 h-3 mr-1" />,
                };
            case "Offering Mentorship":
            case "Seeking Mentorship":
                return {
                    text: status,
                    colorClass: "bg-blue-500 dark:bg-blue-600",
                    icon: <GraduationCap className="w-3 h-3 mr-1" />,
                };
            case "Looking for Project":
                return {
                    text: status,
                    colorClass:
                        "bg-yellow-500 dark:bg-yellow-600 text-black dark:text-black",
                    icon: <Briefcase className="w-3 h-3 mr-1" />,
                }; // Added text-black for yellow
            case "Currently Busy":
                return {
                    text: status,
                    colorClass: "bg-red-500 dark:bg-red-600",
                    icon: null,
                };
            default:
                return {
                    text: status,
                    colorClass: "bg-gray-500 dark:bg-gray-700",
                    icon: null,
                };
        }
    };
    const statusDisplay = getCollaborationStatusDisplay(
        user.collaboration_status
    );

    return (
        <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
                {" "}
                {/* Changed items-center to items-start */}
                <img
                    src={imageSrc}
                    alt={`Photo of ${user.name}`}
                    width={64}
                    height={64}
                    className="rounded-full border mt-1" // Added mt-1 for alignment
                    data-ai-hint="person profile faculty student"
                    // Add onError fallback
                    onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/${
                            user.user_type
                        }${user._id.split("-")[1]}-fallback/64/64`;
                    }}
                />
                <div className="flex-1">
                    <CardTitle className="text-lg">
                        {user.name || "Unnamed User"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-sm">
                        {isFaculty ? (
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        )}
                        {user.department || "No Department"}
                    </CardDescription>
                    {/* Collaboration Status Badge */}
                    {user.collaboration_status && (
                        // Apply color class dynamically, ensure hover doesn't break it
                        <Badge
                            variant="default"
                            className={`mt-2 text-xs inline-flex items-center ${statusDisplay.colorClass} text-white hover:${statusDisplay.colorClass}`}
                        >
                            {statusDisplay.icon}
                            {statusDisplay.text}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 pt-2">
                <p className="text-sm text-muted-foreground">{truncatedBio}</p>
                <div>
                    <h4 className="text-xs font-semibold mb-1 text-foreground/80">
                        Research Interests:
                    </h4>
                    {interests.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {interests.slice(0, 3).map((interest: string) =>
                                interest ? (
                                    <Badge
                                        key={interest}
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {interest}
                                    </Badge>
                                ) : null
                            )}
                            {interests.length > 3 && (
                                <Badge
                                    variant="outline"
                                    className="text-xs"
                                >
                                    +{interests.length - 3} more
                                </Badge>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            No interests listed.
                        </p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-2">
                <Button
                    variant="link"
                    asChild
                    className="p-0 h-auto text-primary text-sm"
                >
                    {/* Link uses the user's ID directly */}
                    <Link href={`/profile/${user._id}`}>
                        View Profile <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
