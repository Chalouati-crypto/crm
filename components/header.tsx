import Image from "next/image";
import Link from "next/link";
import Profile from "./profile";
import { Separator } from "@/components/ui/separator";
import NavLink from "./nav-link";
import { Button } from "./ui/button";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Contacts", href: "/contacts" },
  { name: "Accounts", href: "/accounts" },
  { name: "Appointments", href: "/appointments" },
  { name: "Surveys", href: "/surveys" },
];
export default function Header() {
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
          {navigation.map((item) => {
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
