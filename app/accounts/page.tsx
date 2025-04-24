import { getAccounts } from "@/server/actions/accounts";
import AccountsView from "./accounts-view";

export default async function Accounts() {
  const accounts = await getAccounts();
  return <AccountsView accounts={accounts} />;
}
