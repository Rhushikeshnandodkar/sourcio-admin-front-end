import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/common/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";

const sofiaPro = localFont({
  src: [
    {
      path: "../assets/fonts/SofiaProLight-english.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/SofiaProRegular-english.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/SofiaProMedium-english.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/SofiaProBold-english.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sofia-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sourcio Admin",
  description: "Sourcio Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sofiaPro.variable} antialiased `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
