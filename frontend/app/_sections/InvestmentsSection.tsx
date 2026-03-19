import { BookNowButton } from "./shared";
import Reveal from "../_components/Reveal";

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  is_active: boolean;
  order: number;
}

export default function InvestmentsSection({ services, content = {} }: { services?: ServiceItem[]; content?: Record<string, string> }) {
  const items = services?.filter((s) => s.is_active) ?? [];
  if (items.length === 0) return null;

  const hasBg = !!content.investments_bg_url;
  const textColor = "text-black";
  const subtitleColor = "text-black";

  return (
    <section
      id="investments"
      className="relative py-10 lg:py-[100px] flex flex-col gap-10 lg:gap-[82px] items-center overflow-hidden"
    >
      {/* Parallax background */}
      {hasBg && (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10)), url(${content.investments_bg_url})`,
            backgroundAttachment: "fixed",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 text-center flex flex-col gap-4 max-w-[647px] px-6">
        <Reveal delay={20}>
          <h2 className={`font-script text-[54px] leading-none ${textColor}`}>
            {content.investments_title || "Investments"}
          </h2>
        </Reveal>
        {content.investments_subtitle && (
          <Reveal delay={90}>
            <p className={`font-serif text-[16px] leading-[22px] ${subtitleColor}`}>{content.investments_subtitle}</p>
          </Reveal>
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:gap-6 w-full max-w-[797px] px-6">
        {items.map((s, i) => (
          <Reveal key={s.id} delay={130 + i * 45}>
            <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4">
              <p className="font-serif text-[22px] lg:text-[32px] text-center md:text-left text-black max-w-[320px]">
                {s.title}
              </p>
              <div className="flex shrink-0 items-center justify-start gap-6 lg:gap-10">
                <p className="font-script leading-none text-[55px] lg:text-[75px] text-black whitespace-nowrap">
                  {s.currency}{s.price}
                </p>
                <BookNowButton dark text={content.investments_button_text} service={s.title} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {content.investments_footer && (
        <Reveal delay={240}>
          <p className="relative z-10 font-serif text-[16px] text-center px-6 text-black">
            {content.investments_footer}
          </p>
        </Reveal>
      )}
    </section>
  );
}
