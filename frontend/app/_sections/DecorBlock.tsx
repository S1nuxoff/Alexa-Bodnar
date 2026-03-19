import Reveal from "../_components/Reveal";

type C = Record<string, string>;

export default function DecorBlock({ content = {} }: { content?: C }) {
  if (!content.decor_text) return null;
  return (
    <div className="bg-[#ededed] flex items-center justify-center h-[87px] lg:h-[284px]">
      <Reveal delay={30} variant="softScale">
        <p className="font-script text-black text-center leading-none px-4" style={{ fontSize: "clamp(24px, 5.5vw, 70px)" }}>
          {content.decor_text}
        </p>
      </Reveal>
    </div>
  );
}
