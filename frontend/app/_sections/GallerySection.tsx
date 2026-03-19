"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function GallerySection({
  photos,
  content = {},
}: {
  photos?: string[];
  content?: Record<string, string>;
}) {
  const gallery = photos && photos.length > 0 ? photos : [];
  const tabletPerPage = 3;
  const desktopPerPage = 6;
  const tabletPages = Math.max(1, Math.ceil(gallery.length / tabletPerPage));
  const desktopPages = Math.max(1, Math.ceil(gallery.length / desktopPerPage));
  const tabletSlides = Array.from({ length: tabletPages }, (_, pageIdx) => {
    const items = gallery.slice(
      pageIdx * tabletPerPage,
      pageIdx * tabletPerPage + tabletPerPage,
    );
    return [
      ...items,
      ...Array(Math.max(0, tabletPerPage - items.length)).fill(null),
    ] as Array<string | null>;
  });
  const desktopSlides = Array.from({ length: desktopPages }, (_, pageIdx) => {
    const items = gallery.slice(
      pageIdx * desktopPerPage,
      pageIdx * desktopPerPage + desktopPerPage,
    );
    return [
      ...items,
      ...Array(Math.max(0, desktopPerPage - items.length)).fill(null),
    ] as Array<string | null>;
  });

  const [tabletPage, setTabletPage] = useState(0);
  const [desktopPage, setDesktopPage] = useState(0);
  const [mobileIdx, setMobileIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [lbTouch, setLbTouch] = useState<number | null>(null);

  const prevTablet = () =>
    setTabletPage((page) => (page - 1 + tabletPages) % tabletPages);
  const nextTablet = () => setTabletPage((page) => (page + 1) % tabletPages);
  const prevDesktop = () =>
    setDesktopPage((page) => (page - 1 + desktopPages) % desktopPages);
  const nextDesktop = () => setDesktopPage((page) => (page + 1) % desktopPages);
  const prevMobile = () =>
    setMobileIdx((idx) => (idx - 1 + gallery.length) % gallery.length);
  const nextMobile = () => setMobileIdx((idx) => (idx + 1) % gallery.length);
  const closeLightbox = () => setLightbox(null);
  const prevLight = useCallback(
    () =>
      setLightbox((idx) => ((idx ?? 0) - 1 + gallery.length) % gallery.length),
    [gallery.length],
  );
  const nextLight = useCallback(
    () => setLightbox((idx) => ((idx ?? 0) + 1) % gallery.length),
    [gallery.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevLight();
      else if (e.key === "ArrowRight") nextLight();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, nextLight, prevLight]);

  useEffect(() => {
    setTabletPage((page) => Math.min(page, tabletPages - 1));
  }, [tabletPages]);

  useEffect(() => {
    setDesktopPage((page) => Math.min(page, desktopPages - 1));
  }, [desktopPages]);

  useEffect(() => {
    setMobileIdx((idx) => Math.min(idx, Math.max(0, gallery.length - 1)));
    setLightbox((idx) =>
      idx === null ? null : Math.min(idx, Math.max(0, gallery.length - 1)),
    );
  }, [gallery.length]);

  if (gallery.length === 0) return null;

  return (
    <>
      <section className="flex flex-col items-center">
        <div className="py-8 lg:py-16 w-full px-3 lg:px-6 flex flex-col gap-5 items-center">
          <div className="relative hidden w-full sm:block lg:hidden">
            <div className="overflow-hidden rounded-[6px]">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${tabletPage * 100}%)` }}
              >
                {tabletSlides.map((slide, pageIdx) => (
                  <div
                    key={pageIdx}
                    className="grid w-full shrink-0 grid-cols-3 gap-3"
                  >
                    {slide.map((src, itemIdx) => {
                      if (!src) {
                        return (
                          <div
                            key={`tablet-empty-${pageIdx}-${itemIdx}`}
                            aria-hidden="true"
                            className="aspect-[2/3] rounded-[6px] opacity-0"
                          />
                        );
                      }

                      const globalIdx = pageIdx * tabletPerPage + itemIdx;

                      return (
                        <button
                          key={src}
                          type="button"
                          className="group relative min-w-0 overflow-hidden rounded-[6px] aspect-[2/3]"
                          onClick={() => setLightbox(globalIdx)}
                          aria-label={`Open gallery photo ${globalIdx + 1}`}
                        >
                          <Image
                            src={src}
                            alt={`Gallery photo ${globalIdx + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            sizes="(min-width: 640px) 30vw, 100vw"
                            quality={80}
                            priority={pageIdx === 0}
                          />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {tabletPages > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevTablet}
                  aria-label="Previous gallery slide"
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-2xl text-[#141414] shadow transition-colors hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextTablet}
                  aria-label="Next gallery slide"
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-2xl text-[#141414] shadow transition-colors hover:bg-white"
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div className="relative hidden w-full lg:block">
            <div className="overflow-hidden rounded-[6px]">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${desktopPage * 100}%)` }}
              >
                {desktopSlides.map((slide, pageIdx) => (
                  <div
                    key={pageIdx}
                    className="grid w-full shrink-0 grid-cols-6 gap-4"
                  >
                    {slide.map((src, itemIdx) => {
                      if (!src) {
                        return (
                          <div
                            key={`empty-${pageIdx}-${itemIdx}`}
                            aria-hidden="true"
                            className="aspect-[2/3] rounded-[6px] opacity-0"
                          />
                        );
                      }

                      const globalIdx = pageIdx * desktopPerPage + itemIdx;

                      return (
                        <button
                          key={src}
                          type="button"
                          className="group relative min-w-0 overflow-hidden rounded-[6px] aspect-[2/3]"
                          onClick={() => setLightbox(globalIdx)}
                          aria-label={`Open gallery photo ${globalIdx + 1}`}
                        >
                          <Image
                            src={src}
                            alt={`Gallery photo ${globalIdx + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            sizes="(min-width: 1280px) 180px, (min-width: 1024px) 14vw, 100vw"
                            quality={80}
                            priority={pageIdx === 0}
                          />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {desktopPages > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevDesktop}
                  aria-label="Previous gallery slide"
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-2xl text-[#141414] shadow transition-colors hover:bg-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={nextDesktop}
                  aria-label="Next gallery slide"
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/75 text-2xl text-[#141414] shadow transition-colors hover:bg-white"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Mobile: 1 per slide */}
          <div className="relative w-full sm:hidden">
            <div
              className="overflow-hidden rounded-[6px]"
              onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStart === null) return;
                const diff = touchStart - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) diff > 0 ? nextMobile() : prevMobile();
                setTouchStart(null);
              }}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${mobileIdx * 100}%)` }}
              >
                {gallery.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    className="relative min-w-full shrink-0 overflow-hidden rounded-[6px] aspect-[2/3]"
                    onClick={() => setLightbox(idx)}
                    aria-label={`Open gallery photo ${idx + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`Gallery photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      quality={75}
                      priority={idx === 0}
                    />
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={prevMobile}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/75 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors cursor-pointer text-[#141414] text-xl"
            >
              ‹
            </button>
            <button
              onClick={nextMobile}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/75 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors cursor-pointer text-[#141414] text-xl"
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-5 items-center py-2">
            {Array.from({ length: tabletPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTabletPage(i)}
                className={`hidden sm:block lg:hidden w-[10px] h-[10px] rounded-full bg-[#141414] transition-opacity cursor-pointer ${i === tabletPage ? "opacity-75" : "opacity-25"}`}
              />
            ))}
            {Array.from({ length: desktopPages }, (_, i) => (
              <button
                key={`desktop-${i}`}
                type="button"
                onClick={() => setDesktopPage(i)}
                className={`hidden lg:block w-[10px] h-[10px] rounded-full bg-[#141414] transition-opacity cursor-pointer ${i === desktopPage ? "opacity-75" : "opacity-25"}`}
              />
            ))}
            {gallery.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMobileIdx(i)}
                className={`sm:hidden w-[10px] h-[10px] rounded-full bg-[#141414] transition-opacity cursor-pointer ${i === mobileIdx ? "opacity-75" : "opacity-25"}`}
              />
            ))}
          </div>
        </div>

        {/* CTA strip with parallax */}
        <div className="relative w-full py-8 lg:py-12 flex flex-col items-center justify-center gap-4 overflow-hidden">
          {content.gallery_cta_bg_url && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${content.gallery_cta_bg_url})`,
                  backgroundAttachment: "fixed",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          <p className="relative z-10 font-script text-[80px] lg:text-[120px] text-white text-center leading-none">
            see more
          </p>
          {(content.gallery_button_text || content.gallery_button_url) && (
            <a
              href={content.gallery_button_url || "#"}
              className="relative z-10 border-2 border-white text-white px-6 py-3 font-sans text-[13px] tracking-[0.15em] uppercase hover:opacity-70 transition-opacity"
            >
              {content.gallery_button_text || "Portfolio"}
            </a>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onTouchStart={(e) => setLbTouch(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (lbTouch === null) return;
            const diff = lbTouch - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
              diff > 0 ? nextLight() : prevLight();
            }
            setLbTouch(null);
          }}
        >
          <button
            className="absolute top-4 right-5 text-white/70 hover:text-white text-4xl leading-none z-10"
            onClick={closeLightbox}
          >
            ×
          </button>
          <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm font-sans tracking-widest">
            {lightbox + 1} / {gallery.length}
          </span>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl z-10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              prevLight();
            }}
          >
            ‹
          </button>
          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={lightbox}
              src={gallery[lightbox]}
              alt={`Gallery photo ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
              priority
            />
          </div>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl z-10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              nextLight();
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
