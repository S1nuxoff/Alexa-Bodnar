import { BookNowButton } from "./shared";
import Reveal from "../_components/Reveal";

type C = Record<string, string>;

export default function HeroSection({ content = {} }: { content?: C }) {
  return (
    <section className="relative w-full h-[526px] md:h-[720px] lg:h-[970px] overflow-hidden">
      {content.hero_bg_url && (
        <img
          src={content.hero_bg_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
      <div className="absolute inset-0 bg-white/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 lg:gap-[54px]">
        <Reveal delay={20} variant="softScale">
          <a href="/" className="block w-[165px] lg:w-[370px]">
            <img
              src="/images/logo.svg"
              alt="Alexa Bodnar Photography"
              className="w-full"
            />
          </a>
        </Reveal>
        <Reveal delay={140}>
          <BookNowButton
            dark
            text={content.hero_button_text}
            href={content.hero_button_url}
          />
        </Reveal>
      </div>
    </section>
  );
}
