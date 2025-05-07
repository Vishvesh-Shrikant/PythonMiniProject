import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'What is AcademiaConnect?',
    answer:
      'AcademiaConnect is a platform designed to help faculty and students within a university find potential collaborators based on shared research interests.',
  },
  {
    question: 'How does the matching work?',
    answer:
      'Our system analyzes the research interests, keywords, and project descriptions listed in user profiles to suggest potential matches with significant overlap.',
  },
  {
    question: 'Who can use AcademiaConnect?',
    answer:
      'Currently, the platform is intended for faculty members and registered students within participating departments of the university.',
  },
  {
    question: 'How do I create or update my profile?',
    answer:
      'Once logged in, navigate to your profile page. You will find options to edit your details, add research interests, list publications, and update your availability.',
  },
  {
    question: 'Is my contact information public?',
    answer:
      'Your basic contact information (like university email) is visible to other logged-in users to facilitate collaboration requests. You can manage privacy settings in your profile.',
  },
  {
    question: 'How do I request collaboration?',
    answer:
        'On a user\'s profile page or the matches page, click the "Request Collaboration" button. This will open a form where you can send a personalized message along with your request.',
    },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">Frequently Asked Questions</h1>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-lg text-left hover:text-primary">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
