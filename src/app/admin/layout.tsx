import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/providers";

export const metadata: Metadata = {
  title: "Admin · IMAGES PRODUCTION",
  description: "Studio dashboard for IMAGES PRODUCTION.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <div className="light min-h-screen bg-background text-foreground">
        {children}
      </div>
    </AdminProviders>
  );
}
