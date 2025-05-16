"use client";
import { DataTable } from "./data-table";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import DeleteAlert from "@/components/delete-alert";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { Survey } from "@/types/survey-schema";
import { columns } from "./columns";
import { deleteSurvey } from "@/server/actions/surveys";
import SurveyDetails from "./survey-details";

export default function SurveysTable({
  surveys,
  role,
}: {
  surveys: Survey[];
  role: string;
}) {
  const { execute: deleteExecute, status: deleteStatus } = useAction(
    deleteSurvey,
    {
      onSuccess() {
        toast.success("Survey successfully deleted!");
        setDeleteOpen(false);
      },
      onError(error) {
        console.error("Delete failed:", error);
        toast.error("Échec de la suppression de l'élève.");
      },
    }
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [surveyToDelete, setSurveyToDelete] = useState<Survey | undefined>(
    undefined
  );
  const [surveyToExpand, setSurveyToExpand] = useState<Survey | undefined>(
    undefined
  );

  const handleDelete = (survey: Survey) => {
    setSurveyToDelete(survey);
    setDeleteOpen(true);
  };
  const handleViewDetails = (survey: Survey) => {
    setSurveyToExpand(survey);
    setDetailsOpen(true);
  };

  return (
    <div>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>Delete Survey</DialogTitle>
          <DeleteAlert
            ressource="Survey"
            setDeleteOpen={setDeleteOpen}
            deleteExecute={deleteExecute}
            id={surveyToDelete?.id}
            deleteStatus={deleteStatus}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[10vh">
          <DialogTitle>View Survey Details</DialogTitle>
          <SurveyDetails survey={surveyToExpand} />
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns(handleDelete, handleViewDetails, role)}
        data={surveys}
      />
    </div>
  );
}
