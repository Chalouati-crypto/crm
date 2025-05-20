import Image from "next/image";
import Link from "next/link";
import Profile from "./profile";
import { Separator } from "@/components/ui/separator";
import NavLink from "./nav-link";
import { getCurrentUser } from "@/lib/get-current-user";

const consultantNavigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Contacts", href: "/contacts" },
  { name: "Accounts", href: "/accounts" },
  { name: "Appointments", href: "/appointments" },
  { name: "Surveys", href: "/surveys" },
];
const adminNavigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Contacts", href: "/contacts" },
  { name: "Accounts", href: "/accounts" },
  { name: "Users", href: "/users" },
  { name: "Surveys", href: "/surveys" },
];
export default async function Header() {
  const user = await getCurrentUser();
  if (!user) return null;
  const isAdmin = user.role === "admin";
  return (
    <>
      <header className="flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            width={100}
            height={100}
            alt="logo of the company"
          />
        </Link>
        <nav className="flex items-center gap-8">
          {isAdmin
            ? adminNavigation.map((item) => {
                return (
                  <NavLink key={item.name} href={item.href} name={item.name} />
                );
              })
            : consultantNavigation.map((item) => {
                return (
                  <NavLink key={item.name} href={item.href} name={item.name} />
                );
              })}
        </nav>
        <div>
          <Profile />
        </div>
      </header>
      <Separator className="mt-4" />
    </>
  );
}
