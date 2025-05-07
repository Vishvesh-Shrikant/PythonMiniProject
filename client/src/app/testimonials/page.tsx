import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Dr. Evelyn Reed & Mark Chen',
    title: 'Professor & PhD Student, Biology',
    quote:
      'AcademiaConnect helped us find each other based on a niche interest in bioinformatics. Our collaboration led to a publication in a top journal!',
    imageSeed: 'testimonial1',
    rating: 5,
  },
  {
    name: 'Prof. Samuel Greene & Aisha Khan',
    title: 'Associate Professor & Masters Student, Computer Science',
    quote:
      'Finding a student interested in reinforcement learning for robotics was tough. This platform made it easy, and Aisha has become an invaluable member of my lab.',
    imageSeed: 'testimonial2',
    rating: 5,
  },
  {
    name: 'Dr. Lena Petrova & David Miller',
    title: 'Assistant Professor & Undergraduate Researcher, Chemistry',
    quote:
      'As a new faculty member, building a research group was daunting. AcademiaConnect connected me with David, a motivated undergrad, perfect for my initial project.',
    imageSeed: 'testimonial3',
    rating: 4,
  },
];

export default function TestimonialsPage() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Success Stories</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Hear from faculty and students who found successful collaborations through AcademiaConnect.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="flex flex-col shadow-lg overflow-hidden">
            <CardHeader className="bg-secondary p-6">
              <div className="flex items-center space-x-4">
                 <img
                    src={`https://picsum.photos/seed/${testimonial.imageSeed}/80/80`}
                    alt={`Photo of ${testimonial.name.split('&')[0].trim()}`} // Use first name for alt
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-background"
                    data-ai-hint="person profile faculty student success story"
                 />
                <div>
                  <CardTitle className="text-lg text-primary-foreground">{testimonial.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-6">
              <blockquote className="italic text-muted-foreground">
              &quot;{testimonial.quote}&quot;
              </blockquote>
            </CardContent>
             <CardFooter className="p-6 pt-0 flex justify-end">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
