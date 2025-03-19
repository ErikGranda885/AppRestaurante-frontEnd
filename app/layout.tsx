// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { ModeToggle } from "@/components/shared/modeToogle";

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
          <footer className="fixed bottom-4 right-4 z-50">
            <ModeToggle />
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
