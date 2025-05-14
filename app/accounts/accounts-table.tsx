import { ClientAccount } from "@/types/account-schema";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import AddAccount from "./add-account";
import { useState } from "react";
import DeleteAlert from "@/components/delete-alert";
import { useAction } from "next-safe-action/hooks";
import { deleteAccount } from "@/server/actions/accounts";
import { toast } from "sonner";
import { set } from "zod";
import { Contact } from "@/types/contact-schema";
import AddContact from "../contacts/add-contact";
import AssignConsultants from "../consultants/assign-consultants";

export default function AccountsTable({
  accounts,
}: {
  accounts: ClientAccount;
}) {
  const { execute: deleteExecute, status: deleteStatus } = useAction(
    deleteAccount,
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
  const [subAccountOpen, setSubAccountOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [parentAccountToAddContactTo, setParentAccountToAddContactTo] =
    useState<ClientAccount | undefined>(undefined);

  const [accountToEdit, setAccountToEdit] = useState<ClientAccount | undefined>(
    undefined
  );
  const [accountToDelete, setAccountToDelete] = useState<
    ClientAccount | undefined
  >(undefined);
  const [parentAccountToExpand, setParentAccountToExpand] =
    useState<ClientAccount>();
  const [accountToAssign, setAccountToAssign] = useState<
    ClientAccount | undefined
  >(undefined);

  const handleEdit = (account: ClientAccount) => {
    setAccountToEdit(account); // State update is asynchronous
    setEditOpen(true);
  };
  const handleDelete = (account: ClientAccount) => {
    setAccountToDelete(account);
    setDeleteOpen(true);
  };
  const handleAddSubAccount = (account: ClientAccount) => {
    setParentAccountToExpand(account);
    setSubAccountOpen(true);
  };
  const handleAddContact = (account: ClientAccount) => {
    setParentAccountToAddContactTo(account);
    setContactOpen(true);
  };

  const handleAssign = (account: ClientAccount) => {
    setAccountToAssign(account);
    setAssignOpen(true);
  };
  return (
    <div>
      <DataTable
        columns={columns(
          handleEdit,
          handleDelete,
          handleAddSubAccount,
          handleAddContact,
          handleAssign
        )}
        data={accounts}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Modifier l&apos;eleve</DialogTitle>
          <AddAccount
            account={accountToEdit}
            handleClose={() => setEditOpen(false)}
            accounts={accounts}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={subAccountOpen} onOpenChange={setSubAccountOpen}>
        <DialogContent>
          <DialogTitle>Add a new sub Account</DialogTitle>
          <AddAccount
            handleClose={() => setSubAccountOpen(false)}
            accountToExpand={parentAccountToExpand}
            accounts={accounts}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>Supprimer l&apos;eleve</DialogTitle>
          <DeleteAlert
            ressource="account"
            setDeleteOpen={setDeleteOpen}
            deleteExecute={deleteExecute}
            id={accountToDelete?.id}
            deleteStatus={deleteStatus}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>Ajouter un Contact</DialogTitle>
          <AddContact
            parentAccount={parentAccountToAddContactTo}
            accounts={accounts}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>Assign consultants</DialogTitle>
          <AssignConsultants
            handleClose={() => setAssignOpen(false)}
            accountId={accountToAssign?.id}
            accountName={accountToAssign?.name}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
