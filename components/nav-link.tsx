"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
type NavLinkProps = {
  name: string;
  href: string;
};
export default function NavLink({ name, href }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link className={isActive ? "text-primary font-semibold" : ""} href={href}>
      {name}
    </Link>
  );
}
