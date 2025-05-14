import { getAppointments } from "@/server/actions/appointments";
import { AppointmentCalendar } from "./appointments-calendar";
import { TypographyH1 } from "@/components/ui/heading-1";
import FormDialog from "@/components/form-dialog";
import { Plus } from "lucide-react";
import AddAppointments from "./add-appointment";
import { getContacts } from "@/server/actions/contacts";
import { auth } from "@/server/auth";

export default async function Appointments() {
  const appointments = await getAppointments(); // Fetch appointments from the database
  const contacts = await getContacts(undefined); // Fetch contacts from the database
  const session = await auth();

  if (!session) return;
  return (
    <div>
      <div className="flex items-center gap-10 mb-8 mt-7">
        <TypographyH1>Appointments</TypographyH1>
        <FormDialog
          trigger="Add Appointment"
          title="Add Appointment"
          icon={<Plus />}
        >
          <AddAppointments contacts={contacts} userId={session?.user.id} />
        </FormDialog>
      </div>
      <AppointmentCalendar appointments={appointments} />
    </div>
  );
}
