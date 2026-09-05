// Utilitários de contraste para o mini site público.
// Calculam luminância relativa (WCAG) e escolhem texto/ícone claro ou escuro.

const hexToRgb = (hex) => {
  let h = (hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

const relLuminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const chan = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * chan[0] + 0.7152 * chan[1] + 0.0722 * chan[2];
};

const contrastRatio = (l1, l2) => {
  const a = Math.max(l1, l2);
  const b = Math.min(l1, l2);
  return (a + 0.05) / (b + 0.05);
};

export const isDark = (hex) => relLuminance(hex) < 0.5;

// Retorna a melhor cor de texto (claro/escuro) para um dado fundo.
export const readableOn = (bgHex, { light = "#FFFFFF", dark = "#0B0B0F" } = {}) => {
  const lum = relLuminance(bgHex);
  const cLight = contrastRatio(relLuminance(light), lum);
  const cDark = contrastRatio(relLuminance(dark), lum);
  return cDark >= cLight ? dark : light;
};

// rgba a partir de hex, com alpha.
export const withAlpha = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Clareia/escurece uma cor hex. amount>0 clareia, amount<0 escurece (0..1).
export const shade = (hex, amount) => {
  const { r, g, b } = hexToRgb(hex);
  const adj = (v) => {
    if (amount >= 0) return Math.round(v + (255 - v) * amount);
    return Math.round(v * (1 + amount));
  };
  const toHex = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${toHex(adj(r))}${toHex(adj(g))}${toHex(adj(b))}`;
};

// Mistura fg sobre bg com alpha (simula transparência) e retorna hex sólido.
export const blendOver = (fgHex, bgHex, alpha) => {
  const f = hexToRgb(fgHex);
  const b = hexToRgb(bgHex);
  const a = Math.max(0, Math.min(1, alpha));
  const mix = (cf, cb) => Math.round(cf * a + cb * (1 - a));
  const toHex = (v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0");
  return `#${toHex(mix(f.r, b.r))}${toHex(mix(f.g, b.g))}${toHex(mix(f.b, b.b))}`;
};
