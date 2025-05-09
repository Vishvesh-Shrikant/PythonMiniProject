// src/app/signup/page.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner'; // Import useAuth
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { X } from 'lucide-react'; // Import X icon for removing interests
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // Ensure Alert components are imported
import { useAuth } from '@/context/AuthContext';


const baseSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
    title: z.string().min(2, {message: 'Title is required.'}),
    department: z.string().min(3, { message: 'Department is required.' }),
    bio: z.string().min(10, { message: 'Bio must be at least 10 characters.' }).max(500, { message: 'Bio cannot exceed 500 characters.' }),
    contactInfo: z.string().min(5, { message: 'Contact info is required (e.g., university email or office number).' }), // Made required
    researchInterests: z.array(z.string()).min(1, { message: 'Please add at least one research interest.' }),
    userType: z.enum(['faculty', 'student'], {
        required_error: "You need to select a user type.",
    }),
    // Fields potentially needed only for faculty (can be optional or added dynamically)
    publications: z.array(z.string()).optional(),
    availability: z.string().optional(),
    currentProjects: z.array(z.string()).optional(), // Added optional currentProjects
});

// Add specific fields based on userType later if needed
const formSchema = baseSchema.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Set error on confirmPassword field
});

type FormData = z.infer<typeof formSchema>;

export default function SignupPage() {
    const { registerFaculty, registerStudent, isLoading } = useAuth(); // Get signup function and loading state
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [currentInterest, setCurrentInterest] = useState(''); // For the interest input field


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            title: '',
            department: '',
            bio: '',
            contactInfo: '', // Initialize contactInfo
            researchInterests: [],
            userType: undefined,
            publications: [],
            availability: '',
            currentProjects: [],
        },
    });

     const handleAddInterest = () => {
        if (currentInterest.trim()) {
            const currentInterests = form.getValues('researchInterests');
            // Ensure case-insensitive check and prevent duplicates
            const lowerCaseInterests = currentInterests.map(i => i.toLowerCase());
            if (!lowerCaseInterests.includes(currentInterest.trim().toLowerCase())) {
                 form.setValue('researchInterests', [...currentInterests, currentInterest.trim()], { shouldValidate: true });
            }
            setCurrentInterest(''); // Clear input field
        }
    };

     const handleRemoveInterest = (interestToRemove: string) => {
        const currentInterests = form.getValues('researchInterests');
        form.setValue(
            'researchInterests',
            currentInterests.filter(interest => interest !== interestToRemove),
             { shouldValidate: true }
        );
    };

    async function onSubmit(values: FormData) {
        setError(null); // Clear previous errors

        // Prepare data for the signup function (excluding confirmPassword)
        // Ensure userType is explicitly included
        const { confirmPassword, ...signupData } = values;
        // Check if userType is selected   
        console.log(confirmPassword)
         if (!signupData.userType) {
             setError('Please select whether you are Faculty or a Student.');
             toast('Please select your role (Faculty or Student).'  );
             return; // Stop submission
         }

        // Add default empty arrays/strings if optional fields are undefined
        const finalSignupData = {
            ...signupData,
            publications: signupData.publications ?? [],
            availability: signupData.availability ?? 'Availability not specified.',
            currentProjects: signupData.currentProjects ?? [],
        };

        if(values.userType =="faculty")
        {
            const success = await registerFaculty(finalSignupData, values.userType);
            if (success) {
                toast('Signup Successful!');
                router.push('/matches'); // Redirect to matches page after successful signup
            } else {
                setError('Signup failed. An account with this email might already exist, or an error occurred.');
                toast('Signup Failed');
            }
        }
        else if (values.userType =="student")
        {
            const success = await registerStudent(finalSignupData, values.userType);
            if (success) {
                toast('Signup Successful!');
                router.push('/matches'); // Redirect to matches page after successful signup
            } else {
                setError('Signup failed. An account with this email might already exist, or an error occurred.');
                toast('Signup Failed');
            }
        }

        
    }

    return (
        <div className="flex justify-center items-center py-8">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Join AcademiaConnect to find collaborators.</CardDescription>
                </CardHeader>
                <CardContent>
                     {error && (
                        <Alert variant="destructive" className="mb-6 p-3 text-sm">
                            <AlertTitle>Signup Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="userType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                    <FormLabel>I am a...</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                                        >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="faculty" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Faculty Member
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                            <RadioGroupItem value="student" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                            Student
                                            </FormLabel>
                                        </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="your.email@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                             <FormDescription>
                                                Must be at least 8 characters.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title / Role</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Professor, PhD Student" {...field} />
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
                                                <Input placeholder="e.g., Computer Science" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                             <FormField
                                control={form.control}
                                name="contactInfo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Information</FormLabel>
                                        <FormControl>
                                            <Input placeholder="University email or office number" {...field} />
                                        </FormControl>
                                         <FormDescription>
                                            How others can reach you for collaboration.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                             <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us a bit about yourself and your academic background..."
                                                className="resize-none"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="researchInterests"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Research Interests</FormLabel>
                                    <div className="flex gap-2">
                                        <FormControl className="flex-grow">
                                            <Input
                                                placeholder="Add an interest (e.g., Machine Learning)"
                                                value={currentInterest}
                                                onChange={(e) => setCurrentInterest(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault(); // Prevent form submission
                                                        handleAddInterest();
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <Button type="button" variant="outline" onClick={handleAddInterest}>Add</Button>
                                     </div>
                                     <div className="flex flex-wrap gap-2 mt-2 min-h-[2rem]">
                                        {field.value.map((interest) => (
                                            <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                                                {interest}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveInterest(interest)}
                                                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 focus:outline-none focus:ring-1 focus:ring-ring ml-1" // Added margin-left
                                                    aria-label={`Remove ${interest}`}
                                                >
                                                     <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />


                            <Button type="submit" className="w-full" disabled={isLoading || form.formState.isSubmitting}>
                                {isLoading || form.formState.isSubmitting ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                 <CardFooter className="flex flex-col items-center text-sm">
                    <p className="text-muted-foreground">
                        Already have an account?{' '}
                        <Button variant="link" className="p-0 h-auto" asChild>
                            <Link href="/login">Log In</Link>
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
