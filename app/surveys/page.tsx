import { TypographyH1 } from "@/components/ui/heading-1";
import { getCurrentUser } from "@/lib/get-current-user";
import { getSurveys } from "@/server/actions/surveys";
import SurveysTable from "./surveys-table";

export default async function Surveys() {
  const user = await getCurrentUser();
  if (!user) return;

  const surveys =
    user.role === "admin"
      ? await getSurveys(undefined)
      : await getSurveys(user.id);

  return (
    <div>
      <div className="flex items-center gap-10 mb-8 mt-20">
        <TypographyH1>View Surveys</TypographyH1>
      </div>
      <SurveysTable surveys={surveys} role={user.role} />
    </div>
  );
}
