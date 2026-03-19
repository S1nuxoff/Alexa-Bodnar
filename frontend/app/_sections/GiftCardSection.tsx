import Reveal from "../_components/Reveal";

type C = Record<string, string>;

export default function GiftCardSection({ content = {} }: { content?: C }) {
  if (!content.gift_p1 && !content.gift_photo_url) return null;

  return (
    <section id="gift-card" className="flex justify-center py-10 lg:h-[538px] lg:py-0 items-center">
      <div className="max-w-[900px] mx-auto px-6 flex flex-col lg:flex-row gap-10 lg:gap-[118px] items-center">
        {(content.gift_p1 || content.gift_p2) && (
          <div className="flex flex-col gap-4 lg:w-[501px]">
            <Reveal delay={20}>
              <p className="font-label text-[15px] tracking-[0.2em] text-black text-center">GIFT CARD</p>
            </Reveal>
            <Reveal delay={80}>
              <div className="flex justify-center h-8 overflow-hidden">
                <img src="/images/gift-divider.png" alt="" className="h-full" />
              </div>
            </Reveal>
            {content.gift_p1 && (
              <Reveal delay={130}>
                <p className="font-label text-[14px] text-black text-center leading-[21px]">{content.gift_p1}</p>
              </Reveal>
            )}
            {content.gift_p2 && (
              <Reveal delay={190}>
                <p className="font-serif text-[14px] text-black text-center leading-[21px]">{content.gift_p2}</p>
              </Reveal>
            )}
          </div>
        )}
        {content.gift_photo_url && (
          <Reveal delay={140} variant="softScale">
            <div className="w-full max-w-[381px] lg:w-[381px] lg:h-[485px] h-[380px] rounded-[6px] overflow-hidden">
              <img src={content.gift_photo_url} alt="Gift Card" className="w-full h-full object-cover" />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
