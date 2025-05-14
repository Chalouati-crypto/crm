"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/ui/loader";
import { assignConsultants } from "@/server/actions/consultants";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignConsultantsProps {
  accountId: string;
  accountName: string;
  handleClose: () => void;
}

export default function AssignConsultants({
  accountId,
  accountName,
  handleClose,
}: AssignConsultantsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const [consultants, setConsultants] = useState<User[]>();
  const [assignedConsultants, setAssignedConsultants] = useState<User[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRes, assignedRes] = await Promise.all([
          fetch("/api/consultants"),
          fetch(`/api/userAccounts/${accountId}`),
        ]);
        const assignedUserAccounts = await assignedRes.json();

        // Extract just the user objects
        const assignedUsers = assignedUserAccounts.map((ua) => ua.user);

        setConsultants(await allRes.json());
        setAssignedConsultants(assignedUsers);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId]);

  const filteredConsultants = useMemo(() => {
    const source = selectedTab === "all" ? consultants : assignedConsultants;
    return source?.filter(
      (consultant) =>
        consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultant.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedTab, consultants, assignedConsultants]);

  if (!consultants || !assignedConsultants || !filteredConsultants)
    return <Loader />;

  const handleAssign = (consultant: User) => {
    setAssignedConsultants((prev) =>
      prev?.some((c: User) => c.id === consultant.id)
        ? prev
        : [...prev, consultant]
    );
  };

  const handleUnassign = (consultant: User) => {
    setAssignedConsultants((prev) =>
      prev?.filter((c: User) => c.id !== consultant.id)
    );
  };

  const handleSave = async () => {
    try {
      const result = await assignConsultants({
        accountId: accountId,
        consultantIds: assignedConsultants.map((c) => c.id),
      });

      if (!result || !result.success) {
        throw new Error(result?.error || "Failed to assign consultants");
      }

      handleClose();
      toast.success(result?.success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  };
  if (loading) return <Loader />;
  return (
    <div className="flex flex-col h-full max-h-[500px]">
      <div className="space-y-4 flex-grow overflow-hidden">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Account</h3>
          <p className="text-base font-semibold">{accountName}</p>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search consultants..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger className="cursor-pointer" value="all">
              All Consultants
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="assigned">
              Assigned ({assignedConsultants.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 overflow-hidden">
            <ScrollArea className="pr-4 h-[250px] overflow-y-auto">
              {filteredConsultants.length > 0 ? (
                <div className="space-y-2">
                  {filteredConsultants.map((consultant) => {
                    const isAssigned = assignedConsultants.some(
                      (c) => c.id === consultant.id
                    );

                    return (
                      <div
                        key={consultant.id}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-muted"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{consultant.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {consultant.email}
                          </span>
                        </div>
                        <Button
                          className="cursor-pointer"
                          variant={isAssigned ? "secondary" : "default"}
                          size="sm"
                          disabled={isAssigned}
                          onClick={() => {
                            handleAssign(consultant);
                          }}
                        >
                          {isAssigned ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Assigned
                            </>
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Assign
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No consultants found
                </p>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="assigned" className="mt-4 overflow-hidden">
            <ScrollArea className="pr-4 h-[250px] overflow-y-auto">
              {filteredConsultants.length > 0 ? (
                <div className="space-y-2">
                  {filteredConsultants.map((consultant) => (
                    <div
                      key={consultant.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-muted"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{consultant.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {consultant.email}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleUnassign(consultant)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Unassign
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No consultants assigned
                </p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end gap-2 mt-auto pt-4">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[#9c27b0] hover:bg-[#7b1fa2]"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
