// components/survey-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { submitSurvey } from "@/server/actions/surveys";
import { toast } from "sonner";

const surveySchema = z.object({
  overallRating: z.number().min(1).max(5),
  serviceQuality: z.number().min(1).max(5),
  suggestions: z.string().optional(),
});

export function SurveyForm({
  appointmentId,
  contactId,
}: {
  appointmentId: string;
  contactId: string;
}) {
  const form = useForm({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      overallRating: 5,
      serviceQuality: 5,
      suggestions: "",
    },
  });

  async function onSubmit(values: z.infer<typeof surveySchema>) {
    try {
      await submitSurvey({
        appointmentId,
        contactId,
        ...values,
      });
      toast.success("Thank you for your feedback!");
    } catch (error) {
      alert("Failed to submit survey. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Overall Rating */}
        <FormField
          control={form.control}
          name="overallRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Rating (1-5)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Quality */}
        <FormField
          control={form.control}
          name="serviceQuality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Quality Rating (1-5)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Suggestions */}
        <FormField
          control={form.control}
          name="suggestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Suggestions for Improvement</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Submit Survey
        </Button>
      </form>
    </Form>
  );
}
