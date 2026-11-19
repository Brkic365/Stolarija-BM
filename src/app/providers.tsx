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

  return (
    <Provider store={store}>
      <SessionProvider>
        <NextUIProvider>
          <MotionConfig reducedMotion="user">
            {!pathname.includes("/admin/login") && <Navbar />}
            {children}
            {!pathname.includes("/admin") && <Footer />}
            <ContactFab />
          </MotionConfig>
        </NextUIProvider>
      </SessionProvider>
    </Provider>
  );
}
