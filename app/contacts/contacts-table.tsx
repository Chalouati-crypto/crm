"use client";
import { Contact } from "@/types/contact-schema";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AddContact from "./add-contact";
import DeleteAlert from "@/components/delete-alert";
import { useAction } from "next-safe-action/hooks";
import { deleteContact, getContacts } from "@/server/actions/contacts";
import { toast } from "sonner";
import { ClientAccount } from "@/types/account-schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import Loader from "@/components/ui/loader";
import AddAppointment from "../appointments/add-appointment";

export default function ContactsTable({
  accounts,
  userId,
  userRole,
}: {
  accounts: ClientAccount[];
  userId: string;
  userRole: "admin" | "consultant";
}) {
  console.log("these are the accounts", accounts);

  const [open, setOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  ); // Changed to store ID
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { execute: deleteExecute, status: deleteStatus } = useAction(
    deleteContact,
    {
      onSuccess() {
        toast.success("Élève supprimé avec succès !");
        setDeleteOpen(false);
      },
      onError(error) {
        console.error("Delete failed:", error);
        toast.error("Échec de la suppression de l'élève.");
      },
    }
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | undefined>(
    undefined
  );
  const [contactToDelete, setContactToDelete] = useState<Contact | undefined>(
    undefined
  );
  const [contactToAppoint, setContactToAppoint] = useState<Contact | undefined>(
    undefined
  );
  const handleEdit = (contact: Contact) => {
    setContactToEdit(contact); // State update is asynchronous
    setEditOpen(true);
  };
  const handleDelete = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteOpen(true);
  };
  const handleAddAppointment = (contact: Contact) => {
    setContactToAppoint(contact);
    setAddAppointmentOpen(true);
  };

  useEffect(() => {
    async function fetchContacts() {
      setIsLoading(true);

      const contacts = selectedAccountId
        ? await getContacts(selectedAccountId)
        : await getContacts(accounts[0]?.id);
      console.log(contacts);
      setContacts(contacts);
      setIsLoading(false);
    }
    fetchContacts();
  }, [selectedAccountId, accounts]);
  if (accounts.length === 0)
    return <DataTable empty={true} columns={[]} data={[]} />;
  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild className="hover:bg-muted">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedAccountId
              ? accounts.find((account) => account.id === selectedAccountId)
                  ?.name
              : "Select account..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command
            filter={(value, search) => {
              // Custom filter function
              const account = accounts.find((acc) => acc.id === value);
              return account?.name?.toLowerCase().includes(search.toLowerCase())
                ? 1
                : 0;
            }}
          >
            <CommandInput placeholder="Search account..." className="h-9" />
            <CommandList>
              <CommandEmpty>No account found.</CommandEmpty>
              <CommandGroup>
                {accounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={account.id}
                    onSelect={(currentValue) => {
                      setSelectedAccountId(
                        currentValue === selectedAccountId ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    {account.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedAccountId === account.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Update contact</DialogTitle>
          <AddContact
            contact={contactToEdit}
            handleClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={addAppointmentOpen} onOpenChange={setAddAppointmentOpen}>
        <DialogContent>
          <DialogTitle>Add Appointment</DialogTitle>
          <AddAppointment
            contacts={contacts}
            userId={userId}
            contactToAppoint={contactToAppoint}
            handleClose={() => setAddAppointmentOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>Delete contact</DialogTitle>
          <DeleteAlert
            ressource="contact"
            setDeleteOpen={setDeleteOpen}
            deleteExecute={deleteExecute}
            id={contactToDelete?.id}
            deleteStatus={deleteStatus}
          />
        </DialogContent>
      </Dialog>
      {isLoading ? (
        <Loader />
      ) : (
        <DataTable
          columns={columns(
            handleEdit,
            handleDelete,
            handleAddAppointment,
            userRole
          )}
          data={contacts}
        />
      )}
    </div>
  );
}
