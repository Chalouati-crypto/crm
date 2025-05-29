import { getAppointments } from "@/server/actions/appointments";
import { AppointmentCalendar } from "./appointments-calendar";
import { TypographyH1 } from "@/components/ui/heading-1";
import FormDialog from "@/components/form-dialog";
import { Plus } from "lucide-react";
import AddAppointments from "./add-appointment";
import { getAssignedContacts } from "@/server/actions/contacts";

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
}

export async function UserAppointments({ user }: { user: User }) {
  const appointments = await getAppointments(user.id);
  const contacts = await getAssignedContacts(user.id);

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
      <AppointmentCalendar appointments={appointments} readOnly={false} />
    </div>
  );
}
