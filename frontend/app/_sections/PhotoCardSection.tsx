import Reveal from "../_components/Reveal";

type C = Record<string, string>;

export default function PhotoCardSection({ content = {} }: { content?: C }) {
  const line1 = content.photocard_line1;
  const line2 = content.photocard_line2;
  const line3 = content.photocard_line3;
  const tag1  = content.photocard_tagline1;
  const tag2  = content.photocard_tagline2;
  const portrait = content.photocard_portrait_url;

  return (
    <>
      <section className="w-full bg-[#E3E3E3] min-h-[546px] md:min-h-[680px] lg:min-h-[900px] flex items-center justify-center">
        <div className="w-full max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center h-full lg:min-h-[900px]">
          {/* Text — left */}
          <div className="flex-1 flex items-center justify-center py-12 lg:py-0">
            {(line1 || line2 || line3) && (
              <div className="flex flex-col items-center text-center text-[#141414]">
                {line1 && <Reveal delay={30}><p className="font-serif text-[34px] md:text-[50px] lg:text-[64px] tracking-[-1.5px] leading-[1.1] mb-4 lg:mb-8">{line1}</p></Reveal>}
                {line2 && <Reveal delay={100}><p className="font-script text-[38px] md:text-[56px] lg:text-[73px] leading-[1] -mt-2 lg:-mt-3">{line2}</p></Reveal>}
                {line3 && <Reveal delay={170}><p className="font-serif text-[34px] md:text-[50px] lg:text-[64px] tracking-[-1.5px] leading-[1.1] mt-4 lg:mt-8">{line3}</p></Reveal>}
              </div>
            )}
          </div>
          {/* Photo — right */}
          {portrait && (
            <Reveal delay={120} variant="softScale" className="w-full lg:w-[48%] lg:self-center">
              <div className="flex items-center justify-center overflow-hidden">
                <img src={portrait} alt="" className="w-auto max-h-[420px] lg:max-h-[780px] object-contain" />
              </div>
            </Reveal>
          )}
        </div>
      </section>
      {(tag1 || tag2) && (
        <div className="text-center py-6 lg:py-10">
          {tag1 && <Reveal delay={40}><p className="font-cursive text-[24px] lg:text-[60px] text-[#141414] leading-normal">{tag1}</p></Reveal>}
          {tag2 && <Reveal delay={110}><p className="font-cursive text-[18px] lg:text-[42px] text-[#141414] leading-normal">{tag2}</p></Reveal>}
        </div>
      )}
    </>
  );
}
