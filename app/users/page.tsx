import FormDialog from "@/components/form-dialog";
import { TypographyH1 } from "@/components/ui/heading-1";
import { getCurrentUser } from "@/lib/get-current-user";
import { Plus } from "lucide-react";
import UsersTable from "./users-table";
import { getUsers } from "@/server/actions/users";
import { AddEditUser } from "./add-user";

export default async function page() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return;
  const users = await getUsers();
  return (
    <div>
      <div className="flex items-center gap-10 mb-8 mt-20">
        <TypographyH1>View Users</TypographyH1>
        <FormDialog trigger="Add users" title="Add users" icon={<Plus />}>
          <AddEditUser />
        </FormDialog>
      </div>
      <UsersTable users={users} userId={user.id} />
    </div>
  );
}
