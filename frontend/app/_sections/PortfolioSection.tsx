import Reveal from "../_components/Reveal";

type C = Record<string, string>;

const ITEMS = [
  { scriptKey: "portfolio_wedding_script",    subtitleKey: "portfolio_wedding_subtitle",    imgKey: "portfolio_wedding_image",    reverse: false },
  { scriptKey: "portfolio_engagement_script", subtitleKey: "portfolio_engagement_subtitle", imgKey: "portfolio_engagement_image", reverse: true },
  { scriptKey: "portfolio_families_script",   subtitleKey: "portfolio_families_subtitle",   imgKey: "portfolio_families_image",   reverse: false },
];

export default function PortfolioSection({ content = {} }: { content?: C }) {
  const visible = ITEMS.filter(({ scriptKey, imgKey }) => content[scriptKey] || content[imgKey]);
  if (visible.length === 0) return null;

  return (
    <section id="portfolio" className="py-8 lg:py-16">
      <Reveal delay={20}>
        <p className="text-center font-label text-[15px] tracking-[0.2em] text-[#141414] mb-8 lg:mb-20">
          PORTFOLIO
        </p>
      </Reveal>
      <div className="max-w-[330px] md:max-w-[760px] lg:max-w-[1200px] mx-auto px-4 flex flex-col gap-6 lg:gap-8">
        {visible.map(({ scriptKey, subtitleKey, imgKey, reverse }) => {
          const script = content[scriptKey] || "";
          const lines  = (content[subtitleKey] || "").split("\n").filter(Boolean);
          const img    = content[imgKey];
          return (
            <div key={scriptKey} className={`flex items-center justify-center gap-4 lg:gap-24 ${reverse ? "flex-row-reverse" : ""}`}>
              <div className="flex flex-col gap-2 lg:gap-4 min-w-0">
                <Reveal delay={60}>
                  <p className="font-script text-black leading-none whitespace-nowrap" style={{ fontSize: "clamp(38px, 9vw, 130px)" }}>
                    {script}
                  </p>
                </Reveal>
                {lines.length > 0 && (
                  <div className="font-serif text-[10px] lg:text-[15px] text-black">
                    {lines.map((line, i) => (
                      <Reveal key={i} delay={100 + i * 35}>
                        <p className="leading-[15px]">{line}</p>
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
              {img && (
                <Reveal delay={120} variant="softScale">
                  <div className="shrink-0 w-[172px] h-[236px] md:w-[300px] md:h-[420px] lg:w-[520px] lg:h-[720px] rounded overflow-hidden">
                    <img src={img} alt={script} className="w-full h-full object-cover" />
                  </div>
                </Reveal>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
