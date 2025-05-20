import { ClientAccount } from "@/types/account-schema";
import { AccountNode } from "./account-node";
import { buildAccountTree } from "@/lib/tree-builder";

interface AccountsTreeProps {
  accounts: ClientAccount[];
  userRole: "admin" | "consultant";
}

export default function AccountsTree({
  accounts,
  userRole,
}: AccountsTreeProps) {
  const accountTree = buildAccountTree(accounts);

  return (
    <div className="account-tree-view border rounded-lg p-4 bg-card">
      {accountTree.map((rootAccount) => (
        <AccountNode key={rootAccount.id} account={rootAccount} />
      ))}
    </div>
  );
}
