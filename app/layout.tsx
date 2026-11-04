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
  title: { default: "InfraDash · GitLab Control Plane", template: "%s · InfraDash" },
  description: "Apple HIG 감성으로 설계된 엔터프라이즈 GitLab 운영 콘솔 데모.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${geistMono.variable} h-full`}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full selection:bg-primary/18 selection:text-foreground">
        <ThemeProvider>
          <TooltipProvider>
            <CommandMenuProvider>
              <SidebarProvider
                style={
                  {
                    "--sidebar-width": "16.5rem",
                    "--header-height": "3.5rem",
                  } as React.CSSProperties
                }
              >
                <AppSidebar variant="inset" />
                <SidebarInset className="min-w-0">
                  <SiteHeader />
                  <div className="flex flex-1 flex-col">
                    <div className="@container/main mx-auto flex w-full max-w-[1600px] flex-1 flex-col">
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
