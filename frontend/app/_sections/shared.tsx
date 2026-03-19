"use client";

export function BookNowButton({ dark = false, text, href, service }: {
  dark?: boolean; text?: string; href?: string; service?: string;
}) {
  const label = text || "Book Now";
  const cls = `border-2 px-6 py-3 font-sans text-[13px] tracking-[0.15em] uppercase transition-opacity hover:opacity-70 cursor-pointer ${
    dark ? "border-[#141414] text-[#141414]" : "border-white text-white"
  }`;

  function handleClick(e: React.MouseEvent) {
    if (service) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("contact:preselect", { detail: service }));
      document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (href && !service) return <a href={href} className={cls}>{label}</a>;
  return <button onClick={handleClick} className={cls}>{label}</button>;
}

export function PlusIcon({ open }: { open: boolean }) {
  return (
    <span className="relative shrink-0 w-[15px] h-[15px] block">
      <span className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#141414] rounded-sm -translate-y-1/2" />
      <span
        className={`absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#141414] rounded-sm -translate-x-1/2 transition-transform duration-200 ${
          open ? "scale-y-0" : "scale-y-100"
        }`}
      />
    </span>
  );
}
