// src/app/profile/[id]/page.tsx
'use client';

import type { User , Faculty, Student} from '@/types/user';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Import the API function to get a user by ID
import { facultyService, studentService} from '@/services/api'; // Assuming getUserById lives here or a shared user service
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added CardDescription
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Briefcase, FileText, Lightbulb, CalendarCheck, FlaskConical, GraduationCap, User as UserIcon, Handshake, Edit, Save, X as CancelIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'; // Added icons
import { Skeleton } from '@/components/ui/skeleton';
import CollaborationRequestForm from '@/components/collaboration-request-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import AlertTitle
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Input } from '@/components/ui/input'; // Import Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


// Define the Zod schema for profile editing
const profileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    title: z.string().min(2, { message: 'Title is required.' }),
    department: z.string().min(3, { message: 'Department is required.' }),
    contactInfo: z.string().min(5, { message: 'Contact info is required (e.g., university email or office number).' }),
    bio: z.string().min(10, { message: 'Bio must be at least 10 characters.' }).max(500, { message: 'Bio cannot exceed 500 characters.' }),
    researchInterests: z.array(z.string().min(1, {message: 'Interest cannot be empty.'})) // Validate each string
                     .min(1, { message: 'Please add at least one research interest.' }),
    currentProjects: z.array(z.string().min(1, {message: 'Project cannot be empty.'})).optional(),
    availability: z.string().optional(),
    collaborationStatus: z.string().nullable().optional(), // Allow null or string
    // Faculty specific - conditionally required based on userType, but Zod handles optional fields well
    publications: z.array(z.string().min(1, {message: 'Publication cannot be empty.'})).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;


// Collaboration Status Options
const collaborationStatusOptions = [
  { value: "Open to Collaboration", label: "Open to Collaboration" },
  { value: "Seeking Collaborations", label: "Seeking Collaborations" },
  { value: "Seeking Project Partners", label: "Seeking Project Partners" },
  { value: "Offering Mentorship", label: "Offering Mentorship" },
  { value: "Seeking Mentorship", label: "Seeking Mentorship" },
  { value: "Looking for Project", label: "Looking for Project" },
  { value: "Currently Busy", label: "Currently Busy" },
  { value: "null", label: "Not Specified" }, // Special value for clearing
];


export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: loggedInUser, isLoading: authLoading, updateProfile } = useAuth(); // Get logged in user and update function
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for fetch errors;
  const router = useRouter();

   // Form handling for editing
   const form = useForm<ProfileFormData>({
     resolver: zodResolver(profileSchema),
     // Default values will be set once profile data is fetched
   });

    // State for managing dynamic input fields (interests, projects, publications)
   const [currentInterestInput, setCurrentInterestInput] = useState('');
   const [currentProjectInput, setCurrentProjectInput] = useState('');
   const [currentPublicationInput, setCurrentPublicationInput] = useState('');

   // Reset form function
   const resetFormWithProfileData = useCallback((profileData: User | null) => {
        if (!profileData) return;
        form.reset({
            name: profileData.name || '',
            department: profileData.department || '',
            contactInfo: profileData.contact_info || '',
            bio: profileData.bio || '',
            researchInterests: profileData.research_interests || [],
            currentProjects: profileData.current_projects || [],
            availability: profileData.availability || '',
            collaborationStatus: profileData.collaboration_status || null,
            publications: (profileData as Faculty).publications || [],
        });
        // Clear dynamic input fields as well
        setCurrentInterestInput('');
        setCurrentProjectInput('');
        setCurrentPublicationInput('');
   }, [form]); // Include form in dependencies

   // Effect to fetch user data from API
    useEffect(() => {
        let isMounted = true; // Track if component is mounted

        async function fetchUser() {
            if (!userId) {
                setError('User ID not found in URL.');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null); // Clear previous errors
            try {
                const foundFaculty = await facultyService.getFacultyById(userId);
                const foudnStudent = await studentService.getStudentById(userId);
                if (isMounted) {
                    if (foundFaculty) {
                        setUserProfile(foundFaculty.data);
                        resetFormWithProfileData(foundFaculty.data); // Initialize form values
                    }
                    else if (foudnStudent) {
                        setUserProfile(foudnStudent.data);
                        resetFormWithProfileData(foudnStudent.data); // Initialize form values
                    }
                    else {
                        setError('User not found.');
                        setUserProfile(null);
                    }
                }
            } catch (fetchError) {
                console.error('Failed to fetch user:', fetchError);
                if (isMounted) {
                     setError(fetchError instanceof Error ? fetchError.message : 'Failed to load profile data.');
                     setUserProfile(null);
                }
            } finally {
                 if (isMounted) {
                    setIsLoading(false);
                 }
            }
        }
        fetchUser();

         // Cleanup function to set isMounted to false when component unmounts
        return () => {
            isMounted = false;
        };

    }, [userId, resetFormWithProfileData]); // Rerun when userId changes or reset function identity changes


   const handleCollaborationSuccess = () => {
    setIsRequestDialogOpen(false);
    toast( 'Collaboration Request Sent');
  };

    const handleEditToggle = () => {
        if (isEditing) {
             // Reset form to current profile values when cancelling edit
             resetFormWithProfileData(userProfile);
        }
        setIsEditing(!isEditing);
    };

    // Helper function to add item to a form array field
    const handleAddItem = useCallback((
        field: keyof Omit<ProfileFormData, 'collaborationStatus' | 'availability' | 'bio' | 'contactInfo' | 'department' | 'title' | 'name'>, // Specify valid array fields
        inputState: string,
        setInputState: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const trimmedInput = inputState.trim();
        if (trimmedInput) {
            const currentItems = form.getValues(field) as string[] || [];
            // Prevent duplicates (case-insensitive)
             const lowerCaseItems = currentItems.map(i => i.toLowerCase());
            if (!lowerCaseItems.includes(trimmedInput.toLowerCase())) {
                form.setValue(field, [...currentItems, trimmedInput], { shouldValidate: true });
            }
            setInputState(''); // Clear input
        }
    }, [form]);

    // Helper function to remove item from a form array field
    const handleRemoveItem = useCallback((
        field: keyof Omit<ProfileFormData, 'collaborationStatus' | 'availability' | 'bio' | 'contactInfo' | 'department' | 'title' | 'name'>, // Specify valid array fields
        itemToRemove: string
    ) => {
        const currentItems = form.getValues(field) as string[] || [];
        form.setValue(
            field,
            currentItems.filter(item => item !== itemToRemove),
            { shouldValidate: true }
        );
    }, [form]);


    // Form submission handler using API
    const onSubmit = async (data: ProfileFormData) => {
        if (!loggedInUser || loggedInUser.id !== userId) {
        toast('Unauthorized editting');
        return;
        }

        // Prepare data for update, handle potential null collaborationStatus
         const updateData = {
            ...data,
            // Convert 'null' string back to actual null for the API
            collaborationStatus: data.collaborationStatus === 'null' ? null : data.collaborationStatus,
        };


        try {
            const success = await updateProfile(userId, updateData); // Call API update
            if (success) {
                 setIsEditing(false); // Exit editing mode on success
                 // Refetch user data to show the latest updates
                try {
                    const updatedFacultyData = await facultyService.getFacultyById(userId);
                    const updatedStudentData = await studentService.getStudentById(userId);
                    const updatedUserData = updatedFacultyData.data || updatedStudentData.data;
                     // Check both responses
                    if (updatedUserData) {
                        setUserProfile(updatedUserData); // Update local state
                        resetFormWithProfileData(updatedUserData); // Reset form with latest data
                         toast('Profile Updated',);
                    } else {
                        // Handle case where refetch fails unexpectedly
                        console.warn("Refetch after update failed.");
                         toast('Update Successful but Refetch Failed');
                         // Optionally revert UI or just rely on next fetch/refresh
                    }
                } catch (refetchError) {
                    console.error("Error refetching profile after update:", refetchError);
                     toast('Update Successful but Refetch Failed');
                }


            } else {
                toast('Update Failed') 
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast( 'Update Error');
        }
    };


  // Loading State
  if (isLoading || authLoading) { // Combine loading states
    return <ProfileSkeleton />;
  }

  // Error State
   if (error && !userProfile) { // Show error only if profile couldn't be loaded
    return (
        <Alert variant="destructive" className="max-w-md mx-auto mt-10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Profile</AlertTitle>
            <AlertDescription>
                {error} Please try refreshing the page or contact support if the issue persists.
                <Button onClick={() => window.location.reload()} size="sm" className="mt-4 ml-auto block">
                    Retry
                </Button>
             </AlertDescription>
        </Alert>
    );
  }

  // User Not Found State (handles case where API returns null explicitly)
  if (!userProfile && !isLoading && !error) {
    return (
        <Alert variant="destructive" className="max-w-md mx-auto flex items-center gap-2 mt-10">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>User not found.</AlertDescription>
        </Alert>
    );
  }

  // Should not happen if logic above is correct, but acts as a safeguard
  if (!userProfile) {
      return <ProfileSkeleton /> // Fallback to skeleton if something went wrong
  }

  // Determine user type and profile ownership
  const isFaculty = userProfile.user_type === 'faculty';
  const isOwnProfile = loggedInUser?.id === userProfile._id;

   // Get collaboration status display
   const getCollaborationStatusDisplay = (status: string | null | undefined) => {
    if (!status || status === 'null') return { text: 'Not Specified', color: 'bg-gray-400 dark:bg-gray-600' };
    switch (status) {
      case 'Open to Collaboration':
      case 'Seeking Collaborations':
      case 'Seeking Project Partners':
        return { text: status, color: 'bg-green-500 dark:bg-green-700' };
      case 'Offering Mentorship':
      case 'Seeking Mentorship':
        return { text: status, color: 'bg-blue-500 dark:bg-blue-700' };
      case 'Looking for Project':
        return { text: status, color: 'bg-yellow-500 dark:bg-yellow-600 text-black dark:text-black' }; // Ensure text visibility on yellow
      case 'Currently Busy':
        return { text: status, color: 'bg-red-500 dark:bg-red-700' };
      default:
        return { text: status, color: 'bg-gray-500 dark:bg-gray-700' };
    }
  };
  const statusDisplay = getCollaborationStatusDisplay(userProfile.collaboration_status);


  return (
    <Form {...form}> {/* Wrap component in FormProvider */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        {/* Profile Header */}
        <Card className="overflow-hidden shadow-lg">
            <CardHeader className="relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-secondary/70 dark:bg-secondary/30">
            {/* Edit Button */}
            {isOwnProfile && (
                <Button
                    type="button" // Important: Prevent form submission
                    variant={isEditing ? "default" : "outline"} // Change cancel to default red potentially
                    size="icon"
                    className={`absolute top-4 right-4 h-8 w-8 z-10 ${isEditing ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
                    onClick={handleEditToggle}
                    aria-label={isEditing ? "Cancel Edit" : "Edit Profile"}
                >
                {isEditing ? <CancelIcon className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
            )}

            <Image
                // Use a default image if photoUrl is missing or invalid
                src={userProfile.profile_image && !userProfile.profile_image.includes('example.com') && !userProfile.profile_image.includes('picsum.photos') ? userProfile.profile_image : `https://picsum.photos/seed/${userProfile.user_type}${userProfile._id.split('-')[1]}/150/150`}
                alt={`Photo of ${userProfile.name}`}
                width={150}
                height={150}
                className="rounded-full border-4 border-background shadow-md flex-shrink-0"
                data-ai-hint="person profile faculty student"
                // Fallback for broken images (including potential 404s from picsum)
                onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${userProfile.user_type}${userProfile._id.split('-')[1]}-fallback/150/150` }}
            />
            <div className="flex-1 space-y-2">
                 {isEditing ? (
                    <>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="text-3xl font-bold p-2 h-auto" /> {/* Adjusted style */}
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                     <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="contactInfo"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Contact Info</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                    ) : (
                    <>
                        <CardTitle className="text-3xl font-bold text-foreground">{userProfile.name}</CardTitle>
                        <p className="text-lg text-muted-foreground flex items-center gap-2">
                        {isFaculty ? <Briefcase className="w-5 h-5"/> : <GraduationCap className="w-5 h-5"/>}
                        - {userProfile.department}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
                            <Mail className="w-4 h-4" /> {userProfile.contact_info}
                        </p>
                    </>
                )}

                {/* Collaboration Status Badge */}
                {!isEditing && (
                    <Badge variant="default" className={`mt-2 text-xs ${statusDisplay.color} text-white`}>
                    {statusDisplay.text}
                    </Badge>
                )}
                 {/* Collaboration Status Select (Editing Mode) */}
                 {isEditing && (
                    <FormField
                        control={form.control}
                        name="collaborationStatus"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Collaboration Status</FormLabel>
                             {/* Ensure value passed to Select is string or undefined */}
                             <Select onValueChange={field.onChange} value={field.value ?? 'null'}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {collaborationStatusOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                )}


                {/* Collaboration Request Button */}
                {!isEditing && !isOwnProfile && loggedInUser && (
                    <div className="pt-2">
                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                            <Handshake className="mr-2 h-4 w-4" /> Request Collaboration
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                            <DialogTitle>Request Collaboration with {userProfile.name}</DialogTitle>
                            </DialogHeader>
                            <CollaborationRequestForm
                                requesterId={loggedInUser._id} // Pass logged in user's ID
                                requestedId={userProfile._id} // Pass profile owner's ID
                                onSuccess={handleCollaborationSuccess}
                            />
                        </DialogContent>
                    </Dialog>
                    </div>
                )}
                {/* Login Prompt for Collaboration */}
                {!isEditing && !isOwnProfile && !loggedInUser && (
                    <Alert variant="default" className="mt-2 p-3 text-sm bg-accent/50 border-accent">
                         <AlertDescription>
                           <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link> to request collaboration.
                         </AlertDescription>
                    </Alert>
                )}
                 {/* Save Changes Button (Editing Mode) */}
                {isEditing && (
                    <Button type="submit" size="sm" className="mt-4 bg-green-600 hover:bg-green-700 text-white" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                )}
            </div>
            </CardHeader>
             {/* Research Interests (View and Edit) */}
             <CardContent className="p-6">
                 <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary"/> Research Interests</h3>
                 {isEditing ? (
                     <FormField
                        control={form.control}
                        name="researchInterests"
                        render={({ field }) => (
                        <FormItem>
                            {/* Input for adding new interest */}
                            <div className="flex gap-2 mb-2">
                                <FormControl>
                                    <Input
                                    placeholder="Add an interest and press Enter..."
                                    value={currentInterestInput}
                                    onChange={(e) => setCurrentInterestInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                             handleAddItem('researchInterests', currentInterestInput, setCurrentInterestInput);
                                        }
                                    }}
                                    />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleAddItem('researchInterests', currentInterestInput, setCurrentInterestInput)}
                                    >
                                    Add
                                </Button>
                            </div>
                             {/* Display existing interests with remove buttons */}
                             <div className="flex flex-wrap gap-2 min-h-[2rem]">
                                {field.value?.map((interest) => (
                                     interest ? ( // Ensure interest is not empty
                                        <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                                            {interest}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem('researchInterests', interest)}
                                                className="rounded-full hover:bg-muted-foreground/20 p-0.5 focus:outline-none focus:ring-1 focus:ring-ring ml-1"
                                                aria-label={`Remove ${interest}`}
                                            >
                                                <CancelIcon className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ) : null
                                ))}
                                 {field.value?.length === 0 && <p className="text-sm text-muted-foreground">No interests added yet.</p>}
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 ) : (
                    <div className="flex flex-wrap gap-2">
                        {userProfile.research_interests?.length > 0 ? (
                            userProfile.research_interests.map((interest) => (
                                interest ? <Badge key={interest} variant="secondary">{interest}</Badge> : null
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No research interests listed.</p>
                        )}
                    </div>
                 )}
             </CardContent>
        </Card>

        {/* Profile Details Tabs */}
        <Tabs defaultValue="bio" className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 gap-1"> {/* Adjust grid cols based on isFaculty */}
            <TabsTrigger value="bio"><UserIcon className="w-4 h-4 mr-1 hidden md:inline"/> Bio</TabsTrigger>
            <TabsTrigger value="projects"><FlaskConical className="w-4 h-4 mr-1 hidden md:inline"/> Projects</TabsTrigger>
            {isFaculty && <TabsTrigger value="publications"><FileText className="w-4 h-4 mr-1 hidden md:inline"/> Publications</TabsTrigger>}
            <TabsTrigger value="availability"><CalendarCheck className="w-4 h-4 mr-1 hidden md:inline"/> Availability</TabsTrigger>
            </TabsList>

            {/* Bio Tab */}
            <TabsContent value="bio">
            <Card>
                <CardHeader>
                    <CardTitle>About {isEditing ? form.getValues('name') : userProfile.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground prose max-w-none dark:prose-invert">
                 {isEditing ? (
                     <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea rows={5} {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                 ) : (
                    <p>{userProfile.bio || 'No bio provided.'}</p>
                 )}
                </CardContent>
            </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
                <Card>
                    <CardHeader><CardTitle>Current Projects</CardTitle></CardHeader>
                    <CardContent>
                        {isEditing ? (
                             <FormField
                                control={form.control}
                                name="currentProjects"
                                render={({ field }) => (
                                <FormItem>
                                    <div className="flex gap-2 mb-2">
                                        <FormControl>
                                            <Input
                                            placeholder="Add a project and press Enter..."
                                            value={currentProjectInput}
                                            onChange={(e) => setCurrentProjectInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddItem('currentProjects', currentProjectInput, setCurrentProjectInput);
                                                }
                                            }}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => handleAddItem('currentProjects', currentProjectInput, setCurrentProjectInput)}
                                            >
                                            Add
                                        </Button>
                                    </div>
                                     <div className="space-y-1">
                                        {field.value?.map((project, index) => (
                                             project ? ( // Check if project is not empty/null
                                                <div key={`${project}-${index}`} className="flex items-center justify-between text-sm bg-secondary/50 p-2 rounded">
                                                    <span>{project}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem('currentProjects', project)}
                                                        className="rounded-full hover:bg-muted-foreground/20 p-1 text-muted-foreground hover:text-destructive"
                                                        aria-label={`Remove ${project}`}
                                                    >
                                                        <CancelIcon className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : null
                                        ))}
                                        {(field.value?.length === 0 || field.value?.every(p => !p)) && <p className="text-sm text-muted-foreground">No projects added yet.</p>}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        ) : (
                            userProfile.current_projects && userProfile.current_projects.filter(p => p).length > 0 ? (
                                <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                                {userProfile.current_projects.map((project, index) => (
                                    project ? <li key={index}>{project}</li> : null // Filter out empty strings
                                ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">No current projects listed.</p>
                            )
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Publications Tab (Faculty Only) */}
            {isFaculty && (
                <TabsContent value="publications">
                    <Card>
                        <CardHeader><CardTitle>Publications</CardTitle></CardHeader>
                         <CardContent>
                            {isEditing ? (
                                <FormField
                                    control={form.control}
                                    name="publications"
                                    render={({ field }) => (
                                    <FormItem>
                                        <div className="flex gap-2 mb-2">
                                            <FormControl>
                                                <Input
                                                placeholder="Add a publication and press Enter..."
                                                value={currentPublicationInput}
                                                onChange={(e) => setCurrentPublicationInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddItem('publications', currentPublicationInput, setCurrentPublicationInput);
                                                    }
                                                }}
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleAddItem('publications', currentPublicationInput, setCurrentPublicationInput)}
                                                >
                                                Add
                                            </Button>
                                        </div>
                                         <div className="space-y-1">
                                            {field.value?.map((pub, index) => (
                                                 pub ? ( // Check if pub is not empty/null
                                                    <div key={`${pub}-${index}`} className="flex items-center justify-between text-sm bg-secondary/50 p-2 rounded">
                                                        <span>{pub}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem('publications', pub)}
                                                            className="rounded-full hover:bg-muted-foreground/20 p-1 text-muted-foreground hover:text-destructive"
                                                            aria-label={`Remove ${pub}`}
                                                        >
                                                            <CancelIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                 ) : null
                                            ))}
                                             {(field.value?.length === 0 || field.value?.every(p => !p)) && <p className="text-sm text-muted-foreground">No publications added yet.</p>}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                             ) : (
                                (userProfile as Faculty).publications?.filter(p => p).length > 0 ? (
                                <ul className="list-decimal space-y-2 pl-5 text-muted-foreground">
                                    {(userProfile as Faculty).publications.map((pub, index) => (
                                     pub ? <li key={index}>{pub}</li> : null // Filter out empty strings
                                    ))}
                                </ul>
                                ) : (
                                <p className="text-muted-foreground">No publications listed.</p>
                                )
                            )}
                         </CardContent>
                    </Card>
                </TabsContent>
            )}

             {/* Availability Tab */}
            <TabsContent value="availability">
            <Card>
                <CardHeader>
                <CardTitle>Availability for Collaboration</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                 {isEditing ? (
                     <FormField
                        control={form.control}
                        name="availability"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea rows={3} placeholder="Describe your availability..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                 ) : (
                    <p>{userProfile.availability || 'Availability not specified.'}</p>
                 )}
                </CardContent>
            </Card>
            </TabsContent>

        </Tabs>
        </form>
    </Form>

  );
}


function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-lg">
         <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-secondary/70 dark:bg-secondary/30">
           <Skeleton className="h-[150px] w-[150px] rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3 w-full">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-9 w-48 mt-2" />
             </div>
         </CardHeader>
         <CardContent className="p-6">
            <Skeleton className="h-5 w-1/4 mb-4" />
             <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
            </div>
         </CardContent>
      </Card>

       <Skeleton className="h-10 w-full rounded-md mb-4" /> {/* Tabs List Skeleton */}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
