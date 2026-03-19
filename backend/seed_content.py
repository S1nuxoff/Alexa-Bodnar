"""
Запуск: python seed_content.py
Заповнює таблицю content початковими текстовими ключами сайту.
"""
import asyncio
from sqlalchemy import select
from app.database import engine, Base, AsyncSessionLocal
from app.models.content import Content

CONTENT = [
    # ── Hero ──────────────────────────────────────────────────────
    ("hero_bg_url", "", "hero", "Фонове зображення (URL)"),

    # ── About ─────────────────────────────────────────────────────
    ("about_title",  "Hello there!", "about", "Заголовок"),
    ("about_intro",  "I\u2019m so glad you\u2019re here.", "about", "Підзаголовок"),
    ("about_p1",
     "You might see me as Sasha, Alexa, or Oleksandra, and it\u2019s all me. "
     "Sasha is the Ukrainian nickname for Oleksandra, and Alexa is the name I use for my work. "
     "Whichever name you choose, it comes from the same heart.",
     "about", "Абзац 1"),
    ("about_p2",
     "I\u2019m a wedding and lifestyle photographer based in Minnesota. "
     "Recently, I married my best friend, and that experience changed the way I see weddings completely. "
     "Going through the planning process myself, I\u2019ve felt every emotion my couples do: the excitement, "
     "the anticipation, the joy, and even the tiny details that make the day feel like you. "
     "When I photograph a wedding, I don\u2019t just see a timeline or a checklist. "
     "I see a story I\u2019ve lived, and I put my whole heart into capturing it for you.",
     "about", "Абзац 2"),
    ("about_p3",
     "I\u2019m also a mama to a little boy who\u2019s changed the way I see the world. "
     "Motherhood has made me slower in the best way, more present, more aware of how fleeting and precious every moment is.",
     "about", "Абзац 3"),
    ("about_p4",
     "I\u2019ve spent over 11 years behind the camera, capturing love in all its beautiful forms: "
     "the magic of a wedding day, the quiet connection between new parents, the joy and chaos of family life. "
     "My style is simple and heartfelt, with timeless images, soft light, and honest emotion. "
     "I love photographs that feel effortless but speak deeply, the kind you\u2019ll want to hold onto for years.",
     "about", "Абзац 4"),
    ("about_p5",
     "If you\u2019re planning a wedding, waiting for a baby, or just wanting to freeze this season of life, "
     "I\u2019d love to be there. To witness, to feel it with you, and to turn it into something lasting \u2014 "
     "whether it\u2019s an engagement session filled with excitement, a cozy family shoot full of laughter, "
     "or a solo portrait to celebrate where you are right now. "
     "I\u2019m here to help you tell your story with warmth, honesty, and heart.",
     "about", "Абзац 5"),
    ("about_photo_url", "", "about", "Фото (URL)"),

    # ── Photo Card ────────────────────────────────────────────────
    ("photocard_line1",    "WEDDING",                  "photocard", "Рядок 1"),
    ("photocard_line2",    "Engagment",                "photocard", "Рядок 2 (скрипт)"),
    ("photocard_line3",    "FAMILIES",                 "photocard", "Рядок 3"),
    ("photocard_tagline1", "Celebrate The Moments",    "photocard", "Слоган рядок 1"),
    ("photocard_tagline2", "with Alexa Bodnar",        "photocard", "Слоган рядок 2"),
    ("photocard_bg_url",      "", "photocard", "Фон (URL)"),
    ("photocard_portrait_url", "", "photocard", "Портрет (URL)"),

    # ── Portfolio ─────────────────────────────────────────────────
    ("portfolio_wedding_script",    "Wedding",    "portfolio", "Wedding — назва (скрипт)"),
    ("portfolio_wedding_subtitle",  "Timeless moments captured\nwith elegance and emotion.", "portfolio", "Wedding — підпис"),
    ("portfolio_wedding_image",     "", "portfolio", "Wedding — фото (URL)"),
    ("portfolio_engagement_script", "Engagement", "portfolio", "Engagement — назва (скрипт)"),
    ("portfolio_engagement_subtitle", "Authentic love stories told\nthrough tender, intimate frames.", "portfolio", "Engagement — підпис"),
    ("portfolio_engagement_image",  "", "portfolio", "Engagement — фото (URL)"),
    ("portfolio_families_script",   "Families",   "portfolio", "Families — назва (скрипт)"),
    ("portfolio_families_subtitle", "Cherished family\nmoments preserved\nwith warmth and joy.", "portfolio", "Families — підпис"),
    ("portfolio_families_image",    "", "portfolio", "Families — фото (URL)"),

    # ── Decor ─────────────────────────────────────────────────────
    ("decor_text", "Real moments. Forever memories", "decor", "Текст"),

    # ── Wedding pricing ───────────────────────────────────────────
    ("wedding_price_title", "WEDDING",                  "wedding", "Заголовок"),
    ("wedding_begin_at",    "begin at",                 "wedding", "Текст «begin at»"),
    ("wedding_price",       "$4500",                    "wedding", "Ціна"),
    ("wedding_duration",    "for 8 hours of coverage",  "wedding", "Тривалість"),
    ("wedding_p1",
     "I also offer extended packages with 10 and 12 hours of coverage with a second photographer "
     "for couples who want their entire day captured \u2014 from quiet morning moments to the last dance under the lights. "
     "Each package includes an engagement session, drone coverage, and a detailed wedding guide filled with tips "
     "and inspiration to help you enjoy your day to the fullest.",
     "wedding", "Опис пакету 1"),
    ("wedding_p2",
     "And if your celebration is smaller or you\u2019re planning something more intimate, "
     "please reach out \u2014 we\u2019ll create something special that fits your vision perfectly.",
     "wedding", "Опис пакету 2"),
    ("wedding_bg_url", "", "wedding", "Фон (URL)"),

    # ── Investments ───────────────────────────────────────────────
    ("investments_title",        "Investments", "investments", "Заголовок"),
    ("investments_subtitle",
     "Every story is unique, so I offer flexible options tailored to your needs. Here are the starting prices:",
     "investments", "Підзаголовок"),
    ("investments_eng_label",    "Engagement / Elopement sessions", "investments", "Рядок 1 — назва"),
    ("investments_eng_price",    "$500",                            "investments", "Рядок 1 — ціна"),
    ("investments_family_label", "Family sessions start at",        "investments", "Рядок 2 — назва"),
    ("investments_family_price", "$450",                            "investments", "Рядок 2 — ціна"),
    ("investments_footer",
     "For full details or to build a custom package, feel free to reach out \u2014 I\u2019d love to chat.",
     "investments", "Нижній текст"),

    # ── Gift Card ─────────────────────────────────────────────────
    ("gift_p1",
     "Surprise someone special with the gift of photography and make their special moments last a lifetime. "
     "Purchase your gift certificate today and give the gift of cherished memories!",
     "gifts", "Абзац 1"),
    ("gift_p2",
     "Whether it\u2019s a family portrait, engagement session, newborn shoot, or any special occasion, "
     "I will create stunning images that tell their unique story.",
     "gifts", "Абзац 2"),
    ("gift_photo_url", "", "gifts", "Фото (URL)"),

    # ── FAQ ───────────────────────────────────────────────────────
    ("faq_1_q", "How would you describe your photography style?", "faq", "Питання 1"),
    ("faq_1_a", "My style is documentary and fine-art \u2014 I focus on authentic emotion, soft natural light, and timeless compositions. I love capturing the in-between moments that feel effortless yet deeply meaningful.", "faq", "Відповідь 1"),
    ("faq_2_q", "Where are you based, and do you travel?", "faq", "Питання 2"),
    ("faq_2_a", "I\u2019m based in Chanhassen, Minnesota, and I love to travel! I\u2019m available throughout the Midwest and beyond for destination weddings and sessions.", "faq", "Відповідь 2"),
    ("faq_3_q", "Do you help with choosing a location?", "faq", "Питання 3"),
    ("faq_3_a", "Absolutely! I\u2019m happy to suggest locations based on your style, the season, and the vibe you\u2019re going for. I know many beautiful spots around Minnesota and can help you find the perfect backdrop.", "faq", "Відповідь 3"),
    ("faq_4_q", "What should we wear for our session?", "faq", "Питання 4"),
    ("faq_4_a", "I recommend wearing something that feels comfortable and true to you. Coordinated (not matching) colors work beautifully. I\u2019ll send you a full style guide after booking!", "faq", "Відповідь 4"),
    ("faq_5_q", "How many images will I receive?", "faq", "Питання 5"),
    ("faq_5_a", "For engagement sessions you\u2019ll receive 60\u2013100+ edited images. For weddings, typically 600\u20131000+ images depending on the hours of coverage.", "faq", "Відповідь 5"),
    ("faq_6_q", "What is your turnaround time?", "faq", "Питання 6"),
    ("faq_6_a", "Engagement sessions are delivered within 2\u20133 weeks. Weddings take 6\u20138 weeks. I always aim to exceed expectations!", "faq", "Відповідь 6"),
    ("faq_7_q", "Do you offer video as well?", "faq", "Питання 7"),
    ("faq_7_a", "I specialize in photography, but I work closely with talented videographers and can recommend trusted professionals.", "faq", "Відповідь 7"),
    ("faq_8_q", "What\u2019s the booking process like?", "faq", "Питання 8"),
    ("faq_8_a", "It\u2019s simple! Reach out via the contact form, we\u2019ll have a quick call to make sure we\u2019re a great fit, then I\u2019ll send you a contract and invoice for your retainer to secure your date.", "faq", "Відповідь 8"),

    # ── Contacts ──────────────────────────────────────────────────
    ("contact_info_p1",       "I wanted to take a moment to express my heartfelt gratitude for visiting my website and exploring my portfolio.", "contacts", "Абзац 1"),
    ("contact_info_p2",       "I\u2019m currently booking wedding, family, personal sessions in the Minnesota area and Midwest.", "contacts", "Абзац 2"),
    ("contact_info_p3",       "I would love to work with you, and you can send me a message for availability and session details!", "contacts", "Абзац 3"),
    ("contact_instagram_url", "https://www.instagram.com", "contacts", "Instagram URL"),
    ("contact_instagram_label", "Follow my Instagram",     "contacts", "Instagram текст"),
    ("contact_address",       "Chanhassen, 55317, Minnesota", "contacts", "Адреса"),
    ("contact_phone",         "+1 (612)-450-2557",            "contacts", "Телефон"),
    ("contact_email",         "alexabodnar15@gmail.com",      "contacts", "Email"),
    ("contact_photo_url",     "",                             "contacts", "Фото (URL)"),
]


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        added = 0
        skipped = 0
        for key, value, section, label in CONTENT:
            result = await db.execute(select(Content).where(Content.key == key))
            existing = result.scalar_one_or_none()
            if not existing:
                db.add(Content(key=key, value=value, section=section, label=label))
                print(f"  + {key}")
                added += 1
            else:
                skipped += 1
        await db.commit()
        print(f"\n\u2713 Seed завершено: {added} додано, {skipped} пропущено")


asyncio.run(main())
