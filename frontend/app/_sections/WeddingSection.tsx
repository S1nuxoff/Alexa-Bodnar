import { BookNowButton } from "./shared";
import Reveal from "../_components/Reveal";

type C = Record<string, string>;

export default function WeddingSection({ content = {} }: { content?: C }) {
  const hasContent =
    content.wedding_price_title || content.wedding_price || content.wedding_p1;
  if (!hasContent) return null;

  return (
    <section className="relative w-full py-16 lg:py-0 lg:h-[1050px] flex items-center justify-center overflow-hidden">
      {content.wedding_bg_url && (
        <img
          src={content.wedding_bg_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
      <div className="absolute inset-0 bg-[rgba(8,8,8,0.64)]" />
      <div className="relative z-10 max-w-[1170px] mx-auto px-6 flex flex-col gap-6 lg:gap-8 items-center text-white">
        <div className="text-center flex flex-col gap-6 lg:gap-10">
          <div className="flex flex-col gap-2 lg:gap-3">
            <div className="flex flex-col gap-2 lg:gap-3">
              {content.wedding_price_title && (
                <Reveal delay={30}>
                  <p className="font-serif text-[34px] lg:text-[90px] tracking-[-2px] leading-none">
                    {content.wedding_price_title}
                  </p>
                </Reveal>
              )}
              {content.wedding_begin_at && (
                <Reveal delay={90}>
                  <p className="font-cursive text-[46px] lg:text-[86px] leading-none">
                    {content.wedding_begin_at}
                  </p>
                </Reveal>
              )}
            </div>
            {content.wedding_price && (
              <Reveal delay={150} variant="softScale">
                <p
                  className="font-script"
                  style={{
                    fontSize: "clamp(110px, 22vw, 200px)",
                    lineHeight: 0.85,
                    marginTop: "-0.15em",
                  }}
                >
                  {content.wedding_price}
                </p>
              </Reveal>
            )}
            {content.wedding_duration && (
              <Reveal delay={190}>
                <p className="font-cursive text-[34px] lg:text-[56px] leading-none">
                  {content.wedding_duration}
                </p>
              </Reveal>
            )}
          </div>
        </div>
        {(content.wedding_p1 || content.wedding_p2) && (
          <Reveal delay={205}>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(255,255,255,0.35))",
                }}
              />
              <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <div
                className="w-16 h-px"
                style={{
                  background:
                    "linear-gradient(to left, transparent, rgba(255,255,255,0.35))",
                }}
              />
            </div>
          </Reveal>
        )}
        {(content.wedding_p1 || content.wedding_p2) && (
          <div className="font-serif text-[16px] lg:text-[20px] text-white text-center max-w-[940px] flex flex-col gap-5 leading-[32px]">
            {content.wedding_p1 && (
              <Reveal delay={220}>
                <p>{content.wedding_p1}</p>
              </Reveal>
            )}
            {content.wedding_p2 && (
              <Reveal delay={270}>
                <p>{content.wedding_p2}</p>
              </Reveal>
            )}
          </div>
        )}
        <Reveal delay={320}>
          <BookNowButton
            service={content.wedding_button_service || undefined}
          />
        </Reveal>
      </div>
    </section>
  );
}
