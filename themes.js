/** Тематические картинки витража (SVG 100×100, встраиваются как data URL). */

export const DEFAULT_THEME_ID = "dawn";

export const THEMES = [
  {
    id: "dawn",
    label: "Рассвет над горами",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="a" x1="0" y1="100" x2="0" y2="0"><stop offset="0" stop-color="#1a1530"/><stop offset=".45" stop-color="#5c2d4a"/><stop offset=".72" stop-color="#c94b3a"/><stop offset="1" stop-color="#f0c14d"/></linearGradient></defs><rect width="100" height="100" fill="url(#a)"/><ellipse cx="50" cy="82" rx="70" ry="22" fill="#12081f" opacity=".55"/><path d="M0 78 L18 58 L32 68 L48 52 L62 62 L78 48 L100 65 V100 H0Z" fill="#0d0618" opacity=".7"/><circle cx="50" cy="36" r="16" fill="#fff8e0" opacity=".95"/><circle cx="50" cy="36" r="22" fill="#ffd36a" opacity=".25"/></svg>`,
  },
  {
    id: "forest",
    label: "Тихий лес",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="100"><stop offset="0" stop-color="#87b8a8"/><stop offset=".5" stop-color="#2d5a45"/><stop offset="1" stop-color="#0f2418"/></linearGradient></defs><rect width="100" height="100" fill="url(#b)"/><circle cx="78" cy="22" r="8" fill="#e8f4ff" opacity=".35"/><path d="M50 8 L62 38 H38Z" fill="#1a3d2e"/><path d="M28 22 L44 52 H12Z" fill="#1e4a38"/><path d="M72 18 L88 48 H56Z" fill="#163528"/><path d="M0 100 L0 62 L14 48 L28 58 L42 44 L58 56 L74 42 L88 54 L100 48 V100Z" fill="#081208" opacity=".85"/></svg>`,
  },
  {
    id: "city",
    label: "Огни города",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="c" x1="0" y1="0" x2="100" y2="100"><stop offset="0" stop-color="#0a1628"/><stop offset="1" stop-color="#1a0a28"/></linearGradient></defs><rect width="100" height="100" fill="url(#c)"/><rect x="8" y="38" width="14" height="62" fill="#162536"/><rect x="26" y="22" width="18" height="78" fill="#1e2d42"/><rect x="48" y="30" width="16" height="70" fill="#152030"/><rect x="68" y="18" width="22" height="82" fill="#1a2840"/><rect x="92" y="44" width="8" height="56" fill="#121f30"/><g fill="#f5d76e" opacity=".9"><rect x="11" y="52" width="3" height="3"/><rect x="16" y="64" width="3" height="3"/><rect x="31" y="40" width="3" height="3"/><rect x="38" y="55" width="3" height="3"/><rect x="52" y="48" width="3" height="3"/><rect x="73" y="32" width="3" height="3"/><rect x="80" y="58" width="3" height="3"/></g><circle cx="22" cy="14" r="3" fill="#fff" opacity=".5"/></svg>`,
  },
  {
    id: "ocean",
    label: "Морская глубь",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="d" x1="0" y1="0" x2="100" y2="100"><stop offset="0" stop-color="#4a90c8"/><stop offset=".5" stop-color="#1e4a6e"/><stop offset="1" stop-color="#0a1c2e"/></linearGradient></defs><rect width="100" height="100" fill="url(#d)"/><path d="M0 52 Q25 48 50 52 T100 52 V100 H0Z" fill="#2a6a8a" opacity=".4"/><path d="M0 62 Q30 56 60 62 T100 58 V100 H0Z" fill="#1a4a62" opacity=".35"/><path d="M0 72 Q28 68 55 74 T100 68 V100 H0Z" fill="#0d3548" opacity=".4"/><circle cx="70" cy="28" r="6" fill="#fff" opacity=".25"/></svg>`,
  },
  {
    id: "bloom",
    label: "Цветущий сад",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="e" x1="50" y1="0" x2="50" y2="100"><stop offset="0" stop-color="#f0e6ff"/><stop offset="1" stop-color="#6b3d7a"/></linearGradient></defs><rect width="100" height="100" fill="url(#e)"/><ellipse cx="50" cy="88" rx="40" ry="10" fill="#2d1830" opacity=".25"/><circle cx="50" cy="48" r="10" fill="#f0c040"/><path d="M50 48 L50 78" stroke="#3d2840" stroke-width="2"/><ellipse cx="38" cy="40" rx="9" ry="14" fill="#e84880" opacity=".9" transform="rotate(-25 38 40)"/><ellipse cx="62" cy="40" rx="9" ry="14" fill="#c848b8" opacity=".9" transform="rotate(25 62 40)"/><ellipse cx="50" cy="32" rx="9" ry="14" fill="#ff7090" opacity=".85"/><ellipse cx="44" cy="52" rx="8" ry="12" fill="#a868c8" opacity=".75" transform="rotate(15 44 52)"/><ellipse cx="56" cy="52" rx="8" ry="12" fill="#6868d8" opacity=".75" transform="rotate(-15 56 52)"/></svg>`,
  },
  {
    id: "aurora",
    label: "Северное сияние",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="f" x1="0" y1="100" x2="100" y2="0"><stop offset="0" stop-color="#050810"/><stop offset=".4" stop-color="#0a1830"/><stop offset="1" stop-color="#0c1020"/></linearGradient></defs><rect width="100" height="100" fill="url(#f)"/><path d="M0 55 Q30 35 50 50 T100 45 V100 H0Z" fill="#2d6b5c" opacity=".55"/><path d="M0 48 Q40 28 55 42 T100 38 V55 Q65 62 50 55 T0 58Z" fill="#4ade80" opacity=".35"/><path d="M0 42 Q35 22 52 38 T100 32 V48 Q60 55 48 48 T0 52Z" fill="#60a5fa" opacity=".3"/><path d="M0 36 Q45 18 58 34 T100 28 V42 Q55 50 42 42 T0 46Z" fill="#c084fc" opacity=".28"/><circle cx="18" cy="16" r="1.5" fill="#fff" opacity=".7"/><circle cx="55" cy="10" r="1" fill="#fff" opacity=".5"/><circle cx="82" cy="20" r="1.2" fill="#fff" opacity=".6"/></svg>`,
  },
];

export function themeDataUrl(themeId) {
  const t = THEMES.find((x) => x.id === themeId) || THEMES[0];
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.svg)}`;
}

export function themeLabel(themeId) {
  const t = THEMES.find((x) => x.id === themeId);
  return t ? t.label : THEMES[0].label;
}
