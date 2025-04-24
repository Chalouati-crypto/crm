"use client";
import { Contact } from "@/types/contact-schema";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AddContact from "./add-contact";
import DeleteAlert from "@/components/delete-alert";
import { useAction } from "next-safe-action/hooks";
import { deleteContact } from "@/server/actions/contacts";
import { toast } from "sonner";

interface ContactTableProps {
  contacts: Contact;
}

export default function ContactsTable({ contacts }: ContactTableProps) {
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
  const [contactToEdit, setContactToEdit] = useState<Contact | undefined>(
    undefined
  );
  const [contactToDelete, setContactToDelete] = useState<Contact | undefined>(
    undefined
  );
  const handleEdit = (account: ClientAccount) => {
    setContactToEdit(account); // State update is asynchronous
    setEditOpen(true);
  };
  const handleDelete = (account: ClientAccount) => {
    setContactToDelete(account);
    setDeleteOpen(true);
  };

  return (
    <div>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Modifier l&apos;eleve</DialogTitle>
          <AddContact
            contact={contactToEdit}
            handleClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>Supprimer l&apos;eleve</DialogTitle>
          <DeleteAlert
            ressource="contact"
            setDeleteOpen={setDeleteOpen}
            deleteExecute={deleteExecute}
            id={contactToDelete?.id}
            deleteStatus={deleteStatus}
          />
        </DialogContent>
      </Dialog>
      <DataTable columns={columns(handleEdit, handleDelete)} data={contacts} />
    </div>
  );
}
