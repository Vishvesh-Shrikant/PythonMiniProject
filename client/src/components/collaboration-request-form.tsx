'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { collaborationService } from '@/services/api';
import { CollaborationRequestInput } from '@/types/collabs';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }).max(500, {message: 'Message cannot exceed 500 characters.'}),
});

interface CollaborationRequestFormProps {
    requesterId: string;
    requestedId: string;
    onSuccess?: () => void; // Optional callback for successful submission
}

export default function CollaborationRequestForm({ requesterId, requestedId, onSuccess }: CollaborationRequestFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const requestData: CollaborationRequestInput = {
            requesterId,
            requestedId,
            message: values.message,
        };

        try {
             // Use API function
            await collaborationService.createRequest(requestData);

            toast('Request Sent!');
            form.reset();
            onSuccess?.(); // Call the success callback if provided
        } catch (error) {
            console.error('Failed to send collaboration request:', error);
             toast('Request Failed',);
        }
    }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Introduce yourself and briefly explain why you'd like to collaborate..."
                  className="resize-none"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
           {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? 'Sending Request...' : 'Send Collaboration Request'}
        </Button>
      </form>
    </Form>
  );
}
