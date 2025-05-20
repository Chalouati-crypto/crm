"use client";
import React, { useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { User } from "@/types/users-schema";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import DeleteAlert from "@/components/delete-alert";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteUser } from "@/server/actions/users";
import { AddEditUser } from "./add-user";

export default function UsersTable({
  users,
  userId,
}: {
  users: User[];
  userId: string;
}) {
  const { execute: deleteExecute, status: deleteStatus } = useAction(
    deleteUser,
    {
      onSuccess() {
        toast.success("utilisateur supprimé avec succès !");
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined);

  const handleEdit = (user: User) => {
    setUserToEdit(user); // State update is asynchronous
    setEditOpen(true);
  };
  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };
  return (
    <>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogTitle>Update User</DialogTitle>
          <AddEditUser
            user={userToEdit}
            handleClose={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>{" "}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>Delete contact</DialogTitle>
          <DeleteAlert
            ressource="user"
            setDeleteOpen={setDeleteOpen}
            deleteExecute={deleteExecute}
            id={userToDelete?.id}
            deleteStatus={deleteStatus}
          />
        </DialogContent>
      </Dialog>
      <DataTable columns={columns(handleDelete, handleEdit)} data={users} />
    </>
  );
}
