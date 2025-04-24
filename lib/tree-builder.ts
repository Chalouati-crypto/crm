import { ClientAccount } from "@/types/account-schema";

export const buildAccountTree = (accounts: ClientAccount[]) => {
  const accountMap = new Map<
    string,
    ClientAccount & { children: ClientAccount[] }
  >();

  // First pass: create map entries for all accounts
  accounts.forEach((account) => {
    accountMap.set(account.id, { ...account, children: [] });
  });

  // Second pass: build the tree structure
  const rootAccounts: (ClientAccount & { children: ClientAccount[] })[] = [];

  accounts.forEach((account) => {
    const accountWithChildren = accountMap.get(account.id)!;

    if (account.parent_account_id === null) {
      // This is a root account
      rootAccounts.push(accountWithChildren);
    } else {
      // This is a child account
      const parent = accountMap.get(account.parent_account_id);
      if (parent) {
        parent.children.push(accountWithChildren);
      }
    }
  });

  return rootAccounts;
};
