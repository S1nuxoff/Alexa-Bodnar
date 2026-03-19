"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";
  const isEditorPage = pathname === "/admin/editor";

  if (isLoginPage) return <>{children}</>;

  if (isEditorPage) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-8 text-center md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800">
              <Monitor size={28} className="text-neutral-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Desktop only</h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                The site editor is not available on mobile devices. Please open it on a desktop or laptop.
              </p>
            </div>
            <Link
              href="/admin"
              className="mt-2 rounded-xl bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-colors hover:text-white"
            >
              Back to admin
            </Link>
          </motion.div>
        </div>

        <div className="hidden h-screen overflow-hidden bg-neutral-950 md:flex">
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-neutral-950">
        <AnimatePresence>
          {drawerOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <motion.div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setDrawerOpen(false)}
              />
              <motion.div
                className="relative z-10 flex h-full flex-col shadow-2xl"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
              >
                <Sidebar onNavigate={() => setDrawerOpen(false)} />
              </motion.div>
              <motion.button
                onClick={() => setDrawerOpen(false)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                className="absolute right-4 top-4 z-20 rounded-lg bg-neutral-800 p-2 text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        <div className="hidden h-full flex-col border-r border-neutral-800 md:flex">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-800 bg-neutral-900 px-4 md:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium text-white">Alexa Bodnar</span>
          </header>

          <motion.main
            key={pathname}
            className="flex-1 overflow-y-auto p-4 md:p-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </AuthGuard>
  );
}
