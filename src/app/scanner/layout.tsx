import { protectPage } from "@/lib/auth";

export default async function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectPage("employee");

  return <>{children}</>;
}
