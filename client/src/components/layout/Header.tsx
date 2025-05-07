// src/components/layout/header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"; // Added SheetClose
import { Menu, University, LogOut, UserCircle, Inbox } from "lucide-react"; // Added Inbox icon
// Import the useAuth hook
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator"; // Added Separator
import { useAuth } from "@/context/AuthContext";

const navItems = [
    { label: "Directory", href: "/directory" },
    { label: "Matches", href: "/matches" },
    { label: "FAQs", href: "/faq" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Contact", href: "/contact" },
];

export default function Header() {
    const { user, logout } = useAuth(); // Get user and logout function from context
    console.log("User in Header:", user); // Debugging line
    const getInitials = (name: string | undefined) => {
        if (!name) return "?"; // Return a placeholder if name is undefined
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2); // Limit to 2 chars
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Link
                    href="/"
                    className="mr-6 flex items-center space-x-2"
                >
                    <University className="h-6 w-6 text-primary" />
                    <span className="font-bold sm:inline-block">
                        AcademiaConnect
                    </span>
                </Link>
                <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4 md:flex-none">
                    {user ? (
                        // Show user menu and logout if logged in
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-8 w-8 rounded-full"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage />
                                        <AvatarFallback>
                                            {getInitials(user.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                forceMount
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user.name ?? "User"}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    {/* Ensure the link uses the user's combined ID */}
                                    <Link
                                        href={`/profile/${user.user._id}`}
                                        className="cursor-pointer"
                                    >
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/collaboration-requests"
                                        className="cursor-pointer"
                                    >
                                        <Inbox className="mr-2 h-4 w-4" />
                                        <span>Requests</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={logout}
                                    className="cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        // Show login/signup buttons if not logged in
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                            >
                                <Link href="/login">Log In</Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                            >
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </>
                    )}

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[300px] sm:w-[400px]"
                            >
                                <div className="flex flex-col h-full">
                                    {/* Main Nav Links */}
                                    <nav className="flex flex-col gap-4 pt-6 px-2 flex-grow">
                                        {navItems.map((item) => (
                                            <SheetClose
                                                asChild
                                                key={item.label}
                                            >
                                                <Link
                                                    href={item.href}
                                                    className="block px-2 py-1 text-lg hover:bg-accent rounded-md"
                                                >
                                                    {item.label}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </nav>

                                    <Separator className="my-4" />

                                    {/* User specific links / Auth buttons */}
                                    <div className="px-2 pb-6">
                                        {user ? (
                                            <div className="flex flex-col gap-2">
                                                <SheetClose asChild>
                                                    {/* Ensure the link uses the user's combined ID */}
                                                    <Link
                                                        href={`/profile/${user.id}`}
                                                        className="flex items-center px-2 py-1 text-lg hover:bg-accent rounded-md"
                                                    >
                                                        <UserCircle className="mr-2 h-5 w-5" />{" "}
                                                        Profile
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link
                                                        href="/collaboration-requests"
                                                        className="flex items-center px-2 py-1 text-lg hover:bg-accent rounded-md"
                                                    >
                                                        <Inbox className="mr-2 h-5 w-5" />{" "}
                                                        Requests
                                                    </Link>
                                                </SheetClose>
                                                {/* Logout button - closes sheet via parent SheetClose or manually if needed */}
                                                <SheetClose asChild>
                                                    <Button
                                                        onClick={logout}
                                                        variant="ghost"
                                                        className="justify-start px-2 py-1 text-lg hover:bg-accent rounded-md w-full"
                                                    >
                                                        <LogOut className="mr-2 h-5 w-5" />{" "}
                                                        Logout
                                                    </Button>
                                                </SheetClose>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <SheetClose asChild>
                                                    <Link
                                                        href="/login"
                                                        className="block px-2 py-1 text-lg hover:bg-accent rounded-md"
                                                    >
                                                        Log In
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link
                                                        href="/signup"
                                                        className="block px-2 py-1 text-lg hover:bg-accent rounded-md"
                                                    >
                                                        Sign Up
                                                    </Link>
                                                </SheetClose>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
