
// // src/app/matches/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// // Updated import path for the API-driven flow
// import { suggestMatches, SuggestMatchesOutput, SuggestMatchesInput } from '@/ai/flows/suggest-matches';
// import UserProfileCard from '@/components/user-profile-card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { UserCheck, LogIn, AlertCircle, Search, Loader2 } from 'lucide-react'; // Added Loader2
// import type { Faculty } from '@/services/faculty';
// import type { Student } from '@/services/students';
// // Import API functions to get user lists for profile fetching
// import { getFacultyList, getUserById } from '@/services/faculty';
// import { getStudentList } from '@/services/students';
// import { Card, CardHeader, CardContent } from '@/components/ui/card';
// import { useAuth } from '@/components/providers/auth-provider';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';
// import type { User } from '@/types/user'; // Use shared User type


// export default function MatchesPage() {
//   const { user, isLoading: authLoading } = useAuth();
//   const [matches, setMatches] = useState<SuggestMatchesOutput | null>(null);
//   // No need to store full profiles separately if UserProfileCard handles fetching or receives full data
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   // Store full profiles temporarily if needed by card, otherwise remove
//   const [fullProfiles, setFullProfiles] = useState<User[]>([]);


//   useEffect(() => {
//     if (authLoading) {
//       setIsLoading(true);
//       return;
//     }
//      if (!user) {
//       setIsLoading(false);
//       setMatches(null);
//       setFullProfiles([]);
//       setError(null);
//       return;
//     }

//     async function fetchMatchesAndProfiles() {
//       setIsLoading(true);
//       setError(null);
//       setMatches(null);
//       setFullProfiles([]);

//       try {
//         // 1. Fetch suggested matches using the logged-in user's info (API Call via Flow)
//         const input: SuggestMatchesInput = {
//           userId: user.id, // Use the combined ID from Auth context
//           userType: user.userType,
//         };
//         const suggested = await suggestMatches(input); // This now uses the API internally
//         setMatches(suggested);

//         if (suggested && suggested.length > 0) {
//             // 2. Fetch full profiles for the suggested matches using API
//             // Fetch users individually or filter from full list (depending on performance)
//             // Fetching individually might be better if lists are huge
//             const profilesPromises = suggested.map(match => getUserById(match.id));
//             const resolvedProfiles = await Promise.all(profilesPromises);
//             const validProfiles = resolvedProfiles.filter((p): p is User => !!p); // Filter out nulls (not found)

//             // Create a map for quick lookup
//             const profileMap = new Map(validProfiles.map(p => [p.id, p]));

//             // Sort profiles based on the order/score from suggested matches
//             const sortedProfiles = suggested
//                 .map(match => profileMap.get(match.id)) // Get profile from map
//                 .filter((p): p is User => !!p); // Ensure only valid User objects remain

//             setFullProfiles(sortedProfiles);
//         } else {
//             setFullProfiles([]);
//         }

//       } catch (err) {
//         console.error('Failed to fetch matches or profiles:', err);
//          if (err instanceof Error) {
//             setError(`Could not load suggested matches: ${err.message}. Please try again later.`);
//         } else {
//             setError('An unknown error occurred while loading matches. Please try again later.');
//         }
//          setMatches([]); // Set matches to empty array on error
//          setFullProfiles([]); // Ensure profiles are empty on error
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchMatchesAndProfiles();
//      // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, authLoading]); // Re-run effect when the user or authLoading changes

//    // Handle Initial Loading State (before auth check completes or data fetch starts)
//    if (isLoading && matches === null) { // Check if matches is still null to show initial load skeleton
//      return (
//          <div className="space-y-8">
//             <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
//             <p className="text-muted-foreground">Finding potential collaborators based on your profile...</p>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[...Array(3)].map((_, i) => (
//                  <UserProfileCard key={`skeleton-${i}`} user={undefined} /> // Use skeleton card
//               ))}
//             </div>
//          </div>
//      );
//    }

//    // Handle logged out state
//    if (!user && !authLoading) { // Ensure auth check is complete
//     return (
//         <div className="space-y-8">
//             <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
//              <p className="text-muted-foreground">
//                 Log in to see potential collaborators based on your profile.
//             </p>
//             <Alert className="max-w-md mx-auto">
//                 <LogIn className="h-4 w-4" />
//                 <AlertTitle>Please Log In</AlertTitle>
//                 <AlertDescription>
//                 You need to be logged in to view your suggested matches.
//                 <Button asChild size="sm" className="mt-4 w-full">
//                 <Link href="/login">Log In</Link>
//                 </Button>
//                 </AlertDescription>
//             </Alert>
//          </div>
//     );
//    }

//     // Handle error state after trying to fetch
//     if (error) {
//         return (
//             <div className="space-y-8">
//             <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
//             <p className="text-muted-foreground">
//                 Based on your profile and research interests, here are some potential collaborators.
//             </p>
//             <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertTitle>Error Loading Matches</AlertTitle>
//                 <AlertDescription>{error}</AlertDescription>
//                  <Button onClick={() => window.location.reload()} size="sm" className="mt-4">
//                     Try Again
//                 </Button>
//             </Alert>
//             </div>
//         );
//     }

//     // Handle case where loading is finished, user is logged in, but matches are still null (might happen briefly)
//     if (isLoading && user) { // Show loading spinner if actively loading for logged-in user
//         return (
//              <div className="space-y-8">
//                  <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
//                  <div className="flex justify-center items-center py-10">
//                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                     <p className="ml-3 text-muted-foreground">Loading matches...</p>
//                  </div>
//              </div>
//         )
//     }


//   // Handle main content display (logged in, no error, loading finished)
//   return (
//     <div className="space-y-8">
//       <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
//       <p className="text-muted-foreground">
//         Based on your profile and research interests, here are some potential collaborators.
//       </p>


//       {!isLoading && matches && matches.length > 0 && fullProfiles.length > 0 ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//          {fullProfiles.map((profile) => {
//             // Find match details for this profile
//             const matchInfo = matches.find(m => m.id === profile.id);
//             // Ensure profile and matchInfo are valid before rendering
//             if (!profile || !profile.id) return null;

//             return (
//                 <div key={profile.id} className="flex flex-col">
//                     {/* Pass the full profile data to the card */}
//                     <UserProfileCard user={profile} />
//                     {matchInfo && matchInfo.sharedInterests && matchInfo.sharedInterests.length > 0 && (
//                         <Card className="mt-[-1px] border-t-0 rounded-t-none p-3 bg-secondary/50 dark:bg-secondary/20">
//                            <p className="text-xs text-muted-foreground">
//                                 <span className="font-medium text-foreground/80">Shared:</span> {matchInfo.sharedInterests.join(', ')}
//                            </p>
//                         </Card>
//                     )}
//                 </div>
//             );
//          })}
//         </div>
//       ) : !isLoading && user ? ( // Ensure user is logged in before showing "No Matches"
//         <Alert>
//             <Search className="h-4 w-4" />
//             <AlertTitle>No Matches Found Yet</AlertTitle>
//             <AlertDescription>
//              We couldn't find any strong matches based on your current profile. Ensure your research interests are up-to-date in your profile for better suggestions, or browse the <Link href="/directory" className="font-medium text-primary hover:underline">Directory</Link>.
//             </AlertDescription>
//         </Alert>
//       ) : null /* Loading or logged out states handled above */}
//     </div>
//   );
// }

// src/app/matches/page.tsx
'use client';

import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogIn, AlertCircle, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User } from '@/types/user';
import { collaborationService } from '@/services/api'; // NEW service
import { useAuth } from '@/context/AuthContext';
import UserProfileCard from '@/components/user-profile-card';

export default function MatchesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [matches, setMatches] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      setMatches([]);
      setIsLoading(false);
      return;
    }

    const fetchMatches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await collaborationService.getMatches();
        setMatches(data.data.matches || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch matches.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user, token, authLoading]);

  // --- UI States ---
  if (authLoading || (isLoading && matches.length === 0)) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
        <p className="text-muted-foreground">Finding potential collaborators...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <UserProfileCard key={`skeleton-${i}`} user={undefined} />
          ))}
        </div>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
        <Alert className="max-w-md mx-auto">
          <LogIn className="h-4 w-4" />
          <AlertTitle>Please Log In</AlertTitle>
          <AlertDescription>
            Log in to see potential collaborators.
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/login">Log In</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => window.location.reload()} size="sm" className="mt-4">
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Suggested Matches</h1>
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <UserProfileCard key={match._id} user={match} />
          ))}
        </div>
      ) : (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertTitle>No Matches Found</AlertTitle>
          <AlertDescription>
            We couldn't find any matches based on your current profile. Make sure your research interests are up-to-date, or explore the{' '}
            <Link href="/directory" className="text-primary font-medium hover:underline">
              Directory
            </Link>.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
