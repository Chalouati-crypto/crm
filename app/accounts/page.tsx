import { getAccounts } from "@/server/actions/accounts";
import AccountsView from "./accounts-view";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function Accounts() {
  const user = await getCurrentUser();
  if (!user) return;
  console.log("user", user);
  const accounts =
    user.role === "admin"
      ? await getAccounts(undefined)
      : await getAccounts(user.id);
  console.log("these are the accounts", accounts);
  return <AccountsView accounts={accounts} userRole={user.role} />;
}
