"use client";

import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";

import { Provider } from "react-redux";
import { store } from "@/redux/store";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Provider store={store}>
      <SessionProvider>
        <NextUIProvider>
          {!pathname.includes("/admin/login") && <Navbar />}
          {children}
          {!pathname.includes("/admin") && <Footer />}
        </NextUIProvider>
      </SessionProvider>
    </Provider>
  );
}
