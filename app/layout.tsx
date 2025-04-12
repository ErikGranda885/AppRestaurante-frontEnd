// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/varios/theme-provider";
import { ModeToggle } from "@/components/shared/varios/modeToogle";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Mi App",
  description: "Descripción de mi app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <footer className="fixed bottom-3 right-2 z-50">
            <ModeToggle />
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
