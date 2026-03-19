import Reveal from "../_components/Reveal";

type C = Record<string, string>;

export default function AboutSection({ content = {} }: { content?: C }) {
  const paras = Object.keys(content)
    .filter((k) => /^about_p\d+$/.test(k))
    .sort((a, b) => parseInt(a.match(/\d+/)![0]) - parseInt(b.match(/\d+/)![0]));

  return (
    <section id="about" className="py-8 lg:py-20">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col lg:flex-row gap-8 lg:gap-16 items-end">
        {/* Photo — left */}
        {content.about_photo_url && (
          <Reveal delay={120} variant="softScale">
            <div className="rounded-[6px] overflow-hidden w-full lg:w-[420px] h-[360px] lg:h-[580px] shrink-0">
              <img src={content.about_photo_url} alt="About Alexa" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        )}
        {/* Text — right */}
        <div className="flex flex-1 flex-col gap-6 lg:min-h-[580px] lg:justify-center lg:gap-8">
          {(content.about_title || content.about_intro) && (
            <div className="flex flex-col gap-4 lg:gap-6">
              <Reveal delay={20}>
                <p className="font-label text-[8px] lg:text-[15px] tracking-[0.2em] text-[#141414]">ABOUT</p>
              </Reveal>
              {content.about_title && (
                <Reveal delay={80}>
                  <h2 className="font-serif text-[30px] lg:text-[70px] tracking-[-1.75px] leading-tight text-black">
                    {content.about_title}
                  </h2>
                </Reveal>
              )}
              {content.about_intro && (
                <Reveal delay={140}>
                  <p className="font-label text-[14px] text-black leading-[21px]">{content.about_intro}</p>
                </Reveal>
              )}
            </div>
          )}
          {paras.length > 0 && (
            <div className="flex flex-col gap-[21px] text-[12px] lg:text-[14px] text-black">
              {paras.map((key, i) => (
                <Reveal key={key} delay={180 + i * 45}>
                  <p className={`${i === 0 ? "font-label" : "font-serif"} leading-[21px]`}>
                    {content[key]}
                  </p>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
