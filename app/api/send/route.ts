// app/api/send-survey-email/route.ts
import { db } from "@/server";
import { contacts } from "@/server/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { toast } from "sonner";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { appointmentId, contactId } = await request.json();
  console.log("API endpoint hit"); // Basic verification
  console.log("Received data:", appointmentId, contactId); // Verify payload
  try {
    // Fetch contact email using contactId
    const contact = await db
      .select({ email: contacts.email })
      .from(contacts)
      .where(eq(contacts.id, contactId))
      .limit(1);

    if (!contact[0]?.email) throw new Error("Contact email not found");

    const surveyLink = `${process.env.NEXTAUTH_URL}/survey/${appointmentId}`;

    // Send email using Resend
    await resend.emails.send({
      from: "CRM <surveys@yourdomain.com>",
      to: contact[0].email,
      subject: "Share Your Feedback",
      html: `
        <h3>We value your opinion!</h3>
        <p>Please complete our survey:</p>
        <a href="${surveyLink}">Start Survey</a>
      `,
    });
    toast.success("Email sent successfully!");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}
