// app/survey/[appointmentId]/page.tsx

import { SurveyForm } from "@/components/survey-form";
import { db } from "@/server";

export default async function SurveyPage({
  params,
}: {
  params: { id: string };
}) {
  const appointment = await db.query.appointments.findFirst({
    where: (appointments, { eq }) => eq(appointments.id, params.id),
    columns: {
      id: true,
      contactId: true,
    },
  });

  if (!appointment || !appointment.contactId) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Invalid Survey Link</h1>
        <p>Please check your survey URL or contact support.</p>
      </div>
    );
  }
  console.log(appointment);
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Service Feedback</h1>
      <SurveyForm
        appointmentId={appointment.id}
        contactId={appointment.contactId}
      />
    </div>
  );
}
