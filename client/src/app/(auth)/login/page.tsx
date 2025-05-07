"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password cannot be empty." }), // Changed min to 1 for presence check
});

const Page = () => {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { login, loading} = useAuth();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError(null); // Clear previous errors
        const success = await login(values);

        if (success) {
            toast("Login Successful!");
            router.push("/matches"); // Redirect to matches page after successful login
            router.refresh(); // Force refresh to update layout state if needed
        } else {
            setError("Invalid email or password. Please try again.");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8">
            {" "}
            {/* Added padding */}
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Log In</CardTitle>
                    <CardDescription>
                        Access your AcademiaConnect account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            {error && (
                                <Alert
                                    variant="destructive"
                                    className="p-3 text-sm"
                                >
                                    <AlertTitle>Login Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="your.email@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    loading || form.formState.isSubmitting
                                }
                            >
                                {loading || form.formState.isSubmitting
                                    ? "Logging In..."
                                    : "Log In"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center text-sm">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Button
                            variant="link"
                            className="p-0 h-auto"
                            asChild
                        >
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Page;
