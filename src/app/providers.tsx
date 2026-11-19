"use client";

import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";

import { Provider } from "react-redux";
import { store } from "@/redux/store";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactFab from "@/components/ContactFab";

import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The slat-wall tool is a full-screen app: no site chrome.
  const isTool = pathname.startsWith("/admin/lamele");

  return (
    <Provider store={store}>
      <SessionProvider>
        <NextUIProvider>
          <MotionConfig reducedMotion="user">
            {!pathname.includes("/admin/login") && !isTool && <Navbar />}
            {children}
            {!pathname.includes("/admin") && <Footer />}
            {!isTool && <ContactFab />}
          </MotionConfig>
        </NextUIProvider>
      </SessionProvider>
    </Provider>
  );
}
