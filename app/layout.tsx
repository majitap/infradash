import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenuProvider } from "@/components/layout/command-menu";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "InfraDash", template: "%s · InfraDash" },
  description: "GitLab 운영 콘솔 데모. 모든 데이터는 모의 데이터입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${geistMono.variable} h-full`}>
      <body className="min-h-full">
        <ThemeProvider>
          <TooltipProvider>
            <CommandMenuProvider>
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "calc(var(--spacing) * 68)",
                    "--header-height": "calc(var(--spacing) * 14)",
                  } as React.CSSProperties
                }
              >
                <AppSidebar variant="inset" />
                <SidebarInset className="min-w-0">
                  <SiteHeader />
                  <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col">
                      <div className="flex flex-col gap-5 py-5 md:gap-6 md:py-6">{children}</div>
                    </div>
                  </div>
                </SidebarInset>
              </SidebarProvider>
              <Toaster richColors position="top-right" />
            </CommandMenuProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
