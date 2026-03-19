"use client";
import { useEffect, useState } from "react";
import { getContent, createContent, updateContent, ContentItem } from "./api";

export default function useSectionContent(section: string) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    getContent().then((all) => {
      const filtered = all.filter((i) => i.section === section);
      setItems(filtered);
      const map: Record<string, string> = {};
      filtered.forEach((i) => { map[i.key] = i.value; });
      setValues(map);
    });
  }, [section]);

  function setValue(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      const existingKeys = new Set(items.map((i) => i.key));
      const ops = Object.entries(values).map(([key, value]) => {
        if (existingKeys.has(key)) {
          return updateContent(key, value);
        } else {
          return createContent({ key, value, section, label: key }).then((created) => {
            setItems((prev) => [...prev, created]);
          });
        }
      });
      await Promise.all(ops);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  return { items, values, setValue, saving, savedAt, saveAll };
}
