"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTree, Plus, Table2 } from "lucide-react";
import AccountsTree from "./accounts-tree";
import AccountsTable from "./accounts-table";
import { useState } from "react";
import { ClientAccount } from "@/types/account-schema";
import { TypographyH1 } from "@/components/ui/heading-1";
import FormDialog from "@/components/form-dialog";
import AddAccount from "./add-account";
interface AccountsViewProps {
  accounts: ClientAccount[];
  userRole: "admin" | "consultant";
}
export default function AccountsView({
  accounts,
  userRole,
}: AccountsViewProps) {
  const [viewMode, setViewMode] = useState<"tree" | "table">("table");

  return (
    <div className="space-y-4 mt-8">
      <Tabs
        defaultValue="table"
        onValueChange={(value) => setViewMode(value as "tree" | "table")}
      >
        <div className="flex justify-end items-center mb-4">
          <TabsList className="bg-muted ">
            <TabsTrigger
              value="tree"
              className="flex items-center gap-2 cursor-pointer "
            >
              <ListTree className="h-4 w-4 " />
              Tree View
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="flex items-center gap-2 cursor-pointer "
            >
              <Table2 className="h-4 w-4 " />
              Table View
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center gap-10 mb-8">
          <TypographyH1>View accounts</TypographyH1>
          {userRole === "admin" && (
            <FormDialog
              trigger="Add account"
              title="Add account"
              icon={<Plus />}
            >
              <AddAccount accounts={accounts} />
            </FormDialog>
          )}
        </div>

        <TabsContent value="tree" className="mt-0">
          <AccountsTree accounts={accounts} userRole={userRole} />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <AccountsTable accounts={accounts} userRole={userRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
