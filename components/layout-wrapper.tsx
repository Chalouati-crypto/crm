import { auth } from "@/server/auth";
import Header from "./header";

export default async function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-12 max-w-screen-3xl mx-auto py-4">
      {session?.user && <Header />}
      {children}
    </div>
  );
}
