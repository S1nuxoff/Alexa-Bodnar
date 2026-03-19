"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PanelsTopLeft, Inbox, Send, LogOut, MailOpen, LayoutDashboard, Briefcase } from "lucide-react";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, group: null },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, group: null },
  { href: "/admin/broadcasts", label: "Broadcasts", icon: Send, group: "Email" },
  { href: "/admin/email-templates", label: "Email Templates", icon: MailOpen, group: null },
  { href: "/admin/editor", label: "Site Editor", icon: PanelsTopLeft, group: "Website" },
  { href: "/admin/services", label: "Services", icon: Briefcase, group: null },
];

export default function Sidebar({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("admin_token");
    onNavigate?.();
    router.push("/admin/login");
  }

  if (collapsed) {
    return (
      <aside className="flex h-full w-14 shrink-0 flex-col border-r border-neutral-800 bg-neutral-900 text-white">
        <div className="flex h-[65px] items-center justify-center border-b border-neutral-700">
          <PanelsTopLeft size={18} className="text-neutral-400" />
        </div>
        <nav className="flex flex-1 flex-col items-center gap-0.5 overflow-y-auto py-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                onClick={onNavigate}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-[#f4a7b9]/15 text-[#f4a7b9] shadow-none"
                    : "text-neutral-500 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Icon size={15} className="shrink-0" />
              </Link>
            );
          })}
        </nav>
        <div className="flex justify-center border-t border-neutral-700 py-3">
          <button
            onClick={logout}
            title="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-neutral-900 text-white">
      <div className="border-b border-neutral-700 p-6">
        <p className="text-xs uppercase tracking-widest text-neutral-400">Admin Panel</p>
        <p className="mt-1 text-lg font-semibold">Alexa Bodnar</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-4">
        {nav.map(({ href, label, icon: Icon, group }) => {
          const active = pathname === href;
          return (
            <div key={href}>
              {group && (
                <p className="mt-1 border-t border-neutral-800/80 px-3 pb-1 pt-3 text-[10px] uppercase tracking-widest text-neutral-600">
                  {group}
                </p>
              )}
              <Link
                href={href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#f4a7b9]/15 font-medium text-[#f4a7b9]"
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <Icon size={15} className="shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-neutral-700 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    </aside>
  );
}
