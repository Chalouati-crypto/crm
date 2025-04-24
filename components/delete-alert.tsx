import { Button } from "./ui/button";

export default function DeleteAlert({
  setDeleteOpen,
  deleteExecute,
  deleteStatus,
  id,
  ressource,
}: {
  setDeleteOpen: (value: boolean) => void;
  deleteExecute: (value: object) => void;
  deleteStatus: string;
  id: number;
  ressource: string;
}) {
  return (
    <div className="flex flex-col items-start justify-start gap-4 ">
      <p className="text-muted-foreground">
        Êtes-vous sûr de vouloir supprimer {ressource} ?
      </p>
      <div className="flex justify-end gap-2 mt-4 ml-auto">
        <Button
          onClick={() => deleteExecute({ id })}
          variant="destructive"
          className={deleteStatus === "loading" ? "animate-pulse" : ""}
        >
          Supprimer
        </Button>
        <Button onClick={() => setDeleteOpen(false)} variant="outline">
          Annuler
        </Button>
      </div>
    </div>
  );
}
