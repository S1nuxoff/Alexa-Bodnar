"use client";
import { useState } from "react";
import { PlusIcon } from "./shared";
import Reveal from "../_components/Reveal";

type C = Record<string, string>;

export default function FAQSection({ content = {} }: { content?: C }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = Object.keys(content)
    .filter((k) => /^faq_\d+_q$/.test(k))
    .sort((a, b) => parseInt(a.match(/\d+/)![0]) - parseInt(b.match(/\d+/)![0]))
    .map((qKey) => {
      const n = qKey.match(/\d+/)![0];
      return { q: content[qKey], a: content[`faq_${n}_a`] || "" };
    })
    .filter(({ q }) => q);

  if (items.length === 0) return null;

    return (
      <section className="py-10 lg:py-[82px] px-6">
      <Reveal delay={20}>
        <p className="font-label text-[15px] tracking-[0.2em] text-[#141414] text-center mb-8">FAQ</p>
      </Reveal>
      <div className="max-w-[1200px] mx-auto flex flex-col">
        {items.map(({ q, a }, i) => (
          <Reveal key={i} delay={70 + i * 35}>
            <div className="border-b border-[rgba(20,20,20,0.22)]">
              <button
                className="flex items-center justify-between w-full py-4 text-left cursor-pointer"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-serif text-[16px] lg:text-[20px] text-black tracking-[-0.5px] leading-snug pr-4">{q}</span>
                <PlusIcon open={openIndex === i} />
              </button>
              {openIndex === i && (
                <div className="pb-5 pr-8">
                  <p className="font-serif text-[14px] lg:text-[16px] text-[#4f4f4f] leading-[24px]">{a}</p>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
