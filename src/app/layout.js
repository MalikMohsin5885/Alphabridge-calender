import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { UserProvider } from "../context/UserContext";
import { ThemeProvider } from "../components/ui/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

if (typeof window !== "undefined") {
  window.onerror = function () {
    return true; // prevent errors from showing
  };
  window.onunhandledrejection = function () {
    return true; // silence promise errors
  };
}
export const metadata = {
  title: "Alphabridge",
  description: "Alphabridge",
};


export default function RootLayout({ children }) {
  return (
    
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeProvider>
        <Script src="https://cdn.jsdelivr.net/npm/heroui-chat-script@0/dist/index.min.js" async />
        <Script src="https://cdn.jsdelivr.net/npm/heroui-chat-script@beta/dist/select-and-edit-utils.global.js" async />
      </body>
    </html>
  );
}
