import ContactsTable from "./contacts-table";
import { TypographyH1 } from "@/components/ui/heading-1";
import FormDialog from "@/components/form-dialog";
import { Plus } from "lucide-react";
import AddContact from "./add-contact";
import { getAccounts } from "@/server/actions/accounts";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function Contacts() {
  const user = await getCurrentUser();
  if (!user) return;
  console.log("user", user);
  const accounts =
    user.role === "admin"
      ? await getAccounts(undefined)
      : await getAccounts(user.id);
  console.log("these are the accounts", accounts);
  return (
    <div>
      <div className="flex items-center gap-10 mb-8 mt-20">
        <TypographyH1>View Contacts</TypographyH1>
        {user.role === "admin" && (
          <FormDialog trigger="Add contact" title="Add contact" icon={<Plus />}>
            <AddContact accounts={accounts} id={user.id} />
          </FormDialog>
        )}
      </div>
      <ContactsTable
        accounts={accounts}
        userId={user.id}
        userRole={user.role}
      />
    </div>
  );
}
