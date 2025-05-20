import { getAppointments } from "@/server/actions/appointments";
import { AppointmentCalendar } from "./appointments-calendar";
import { TypographyH1 } from "@/components/ui/heading-1";
import FormDialog from "@/components/form-dialog";
import { Plus } from "lucide-react";
import AddAppointments from "./add-appointment";
import { getAssignedContacts } from "@/server/actions/contacts";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function Appointments() {
  const user = await getCurrentUser();
  if (!user) return;

  const appointments = await getAppointments(user.id); // Fetch appointments from the database
  const contacts = await getAssignedContacts(user.id); // Fetch contacts from the database
  console.log("these are the contacts", contacts);

  return (
    <div>
      <div className="flex items-center gap-10 mb-8 mt-7">
        <TypographyH1>Appointments</TypographyH1>
        <FormDialog
          trigger="Add Appointment"
          title="Add Appointment"
          icon={<Plus />}
        >
          <AddAppointments accountsWithContacts={contacts} userId={user.id} />
        </FormDialog>
      </div>
      <AppointmentCalendar appointments={appointments} />
    </div>
  );
}
