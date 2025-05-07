import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, Handshake } from 'lucide-react';


export default function Home() {
  return (
    <div className="flex flex-col items-center text-center space-y-12">
    {/* Hero Section */}
    <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary rounded-lg shadow-sm">
      <div className="container px-4 md:px-6 space-y-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-primary-foreground">
          Find Your Next Research Partner on AcademiaConnect
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Connect with faculty and students across departments based on shared research interests. Foster collaboration, spark innovation, and advance your academic journey.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/directory">Find a Collaborator</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
            <Link href="/directory">Browse Profiles</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* How It Works Section */}
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <Users className="h-8 w-8" />
              </div>
              <CardTitle>1. Create Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Build your detailed profile highlighting your research interests, projects, and collaboration goals.
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <Search className="h-8 w-8" />
              </div>
              <CardTitle>2. Match by Interest</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Our intelligent system suggests potential collaborators based on overlapping research areas and keywords.
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <Handshake className="h-8 w-8" />
              </div>
              <CardTitle>3. Start Collaborating</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              Connect with suggested matches, send collaboration requests, and begin your next research project.
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    {/* Placeholder Feature Section */}
     <section className="w-full py-12 md:py-24 bg-secondary rounded-lg shadow-sm">
      <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2 text-left space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary-foreground">Unlock Research Potential</h2>
          <p className="text-muted-foreground md:text-lg">
            Discover diverse expertise, find mentorship opportunities, and contribute to groundbreaking research within your university.
          </p>
          <Button asChild>
            <Link href="/faq">Learn More</Link>
          </Button>
        </div>
        <div className="md:w-1/2">
           <img
            src="https://picsum.photos/600/400"
            alt="Collaboration illustration"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
            data-ai-hint="collaboration research university"
          />
        </div>
      </div>
    </section>
  </div>
);
}