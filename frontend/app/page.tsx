import HeroSection from "./_sections/HeroSection";
import AboutSection from "./_sections/AboutSection";
import PhotoCardSection from "./_sections/PhotoCardSection";
import PortfolioSection from "./_sections/PortfolioSection";
import DecorBlock from "./_sections/DecorBlock";
import GallerySection from "./_sections/GallerySection";
import WeddingSection from "./_sections/WeddingSection";
import InvestmentsSection, { ServiceItem } from "./_sections/InvestmentsSection";
import GiftCardSection from "./_sections/GiftCardSection";
import FAQSection from "./_sections/FAQSection";
import ContactSection from "./_sections/ContactSection";
import Reveal from "./_components/Reveal";

const API = process.env.API_URL || "http://localhost:8000/api";

const FETCH_OPTS: RequestInit = { cache: "no-store" };

async function getContent(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API}/content/`, FETCH_OPTS);
    if (!res.ok) return {};
    const items: { key: string; value: string }[] = await res.json();
    const map: Record<string, string> = {};
    items.forEach((i) => { if (i.value) map[i.key] = i.value; });
    return map;
  } catch {
    return {};
  }
}

// Тільки ці категорії — фото з адмін-галереї
const GALLERY_CATEGORIES = new Set(["gallery"]);

async function getGalleryPhotos(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/gallery/`, FETCH_OPTS);
    if (!res.ok) return [];
    const photos: { url: string; is_active: boolean; order: number; category: string }[] = await res.json();
    return photos
      .filter((p) => p.is_active && GALLERY_CATEGORIES.has(p.category))
      .sort((a, b) => a.order - b.order)
      .map((p) => p.url);
  } catch {
    return [];
  }
}

async function getServices(): Promise<ServiceItem[]> {
  try {
    const res = await fetch(`${API}/services/`, FETCH_OPTS);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const QUICK_LINKS = [
  { num: "01", label: "ABOUT",       href: "#about" },
  { num: "02", label: "PORTFOLIO",   href: "#portfolio" },
  { num: "03", label: "INVESTMENTS", href: "#investments" },
  { num: "04", label: "GIFT CARD",   href: "#gift-card" },
  { num: "05", label: "CONTACTS",    href: "#contacts" },
];

export default async function Page() {
  const [rawContent, galleryPhotos, services] = await Promise.all([
    getContent(),
    getGalleryPhotos(),
    getServices(),
  ]);

  // Strip localhost origin from stored URLs so they work through any proxy/tunnel
  function normalizeUrl(v: string) {
    return v.replace(/^https?:\/\/localhost:\d+/, "");
  }

  // Apply field-level visibility: hidden_KEY="1" → replace field value with ""
  const content: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawContent)) {
    if (k.startsWith("hidden_")) continue;
    const val = rawContent[`hidden_${k}`] === "1" ? "" : normalizeUrl(v);
    content[k] = val;
  }
  // Preserve section visibility flags (section_X_hidden)
  for (const [k, v] of Object.entries(rawContent)) {
    if (k.startsWith("section_")) content[k] = v;
  }

    return (
      <main className="bg-white overflow-x-hidden">
        {content.section_hero_hidden !== "1" && <HeroSection content={content} />}

        <section className="pt-6 pb-4 lg:pt-6 lg:pb-0">
          <Reveal delay={120} variant="up">
            <p className="text-center font-label text-[8px] lg:text-[15px] tracking-[0.2em] text-[#141414] mb-4 lg:mb-6">
              QUICK LINKS
            </p>
          </Reveal>
          <div className="max-w-[1200px] mx-auto px-6 lg:px-10 flex flex-col items-center lg:items-start gap-[22px] lg:gap-[44px]">
            {QUICK_LINKS.map(({ num, label, href }, index) => (
              <Reveal key={num} delay={150 + index * 55} variant="up">
                <a
                  href={href}
                  className="font-serif text-[16px] lg:text-[62px] text-black underline decoration-[1px] underline-offset-4 leading-none hover:opacity-60 transition-opacity"
                >
                  {num} {label}
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {content.section_about_hidden !== "1" && <AboutSection content={content} />}
        {content.section_photocard_hidden !== "1" && <PhotoCardSection content={content} />}
        {content.section_portfolio_hidden !== "1" && <PortfolioSection content={content} />}
        {content.section_decor_hidden !== "1" && <DecorBlock content={content} />}
        {content.section_gallery_hidden !== "1" && <GallerySection photos={galleryPhotos} content={content} />}
        {content.section_wedding_hidden !== "1" && <WeddingSection content={content} />}
        {content.section_investments_hidden !== "1" && <InvestmentsSection services={services} content={content} />}
        {content.section_gifts_hidden !== "1" && <GiftCardSection content={content} />}
        {content.section_faq_hidden !== "1" && <FAQSection content={content} />}
        {content.section_contacts_hidden !== "1" && <ContactSection content={content} />}
      </main>
    );
  }
