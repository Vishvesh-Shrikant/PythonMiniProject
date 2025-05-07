'use client';

import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LogIn, AlertCircle, Search} from 'lucide-react';
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
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch matches.');
        }
      }
      setIsLoading(false);
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
            We couldn&apos;t find any matches based on your current profile. Make sure your research interests are up-to-date, or explore the{' '}
            <Link href="/directory" className="text-primary font-medium hover:underline">
              Directory
            </Link>.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
