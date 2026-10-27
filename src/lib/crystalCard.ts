/**
 * Your Crystal card — 1080x1350 PNG rendered client-side on a canvas.
 * Dark, quiet, serif + thin mono (same language as GameTitle). No neon.
 */
import {
  CRYSTAL_SITE_MARK,
  hexToRgb,
  wrapLines,
  withAlpha,
  type SoulTriple,
} from "@/lib/crystal";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

const SERIF = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const MONO = '"IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace';
const INK = "rgba(238, 234, 226, 0.92)";
const INK_2 = "rgba(238, 234, 226, 0.62)";

export interface CrystalCardInput {
  name: string;
  essence: string;
  colors: SoulTriple;
  gemSrc?: string;
}

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/** Wait for the page fonts so the canvas does not fall back to a default. */
const ensureFonts = async () => {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`300 64px ${SERIF}`),
      document.fonts.load(`italic 300 40px ${SERIF}`),
      document.fonts.load(`300 22px ${MONO}`),
    ]);
  } catch {
    // Fonts are decoration; the fallback stack is fine.
  }
};

const spacedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) => {
  // Manual tracking: canvas letterSpacing is not available everywhere.
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cursor = x - total / 2;
  chars.forEach((c, i) => {
    ctx.fillText(c, cursor, y);
    cursor += widths[i] + spacing;
  });
};

export async function renderCrystalCard(input: CrystalCardInput): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  const [gem] = await Promise.all([loadImage(input.gemSrc ?? "/game/gems/gem_dodeca.png"), ensureFonts()]);

  const cx = CARD_WIDTH / 2;
  const gemY = 470;

  // Ground.
  ctx.fillStyle = "#07080a";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Spectrum leaving the crystal: soft colored rays fanning downward.
  const rays = [
    { color: input.colors[0], angle: 0.55 },
    { color: input.colors[1], angle: 0 },
    { color: input.colors[2], angle: -0.55 },
  ];
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (const ray of rays) {
    ctx.save();
    ctx.translate(cx, gemY);
    ctx.rotate(ray.angle);
    const g = ctx.createLinearGradient(0, 0, 0, 760);
    g.addColorStop(0, withAlpha(ray.color, 0.5));
    g.addColorStop(0.55, withAlpha(ray.color, 0.16));
    g.addColorStop(1, withAlpha(ray.color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-26, 40);
    ctx.lineTo(26, 40);
    ctx.lineTo(150, 760);
    ctx.lineTo(-150, 760);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // Halo of the dominant color behind the crystal.
  const halo = ctx.createRadialGradient(cx, gemY, 20, cx, gemY, 420);
  halo.addColorStop(0, withAlpha(input.colors[0], 0.28));
  halo.addColorStop(1, withAlpha(input.colors[0], 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, CARD_WIDTH, 900);
  ctx.restore();

  // Thin white beam entering from above.
  const beam = ctx.createLinearGradient(0, 0, 0, gemY);
  beam.addColorStop(0, "rgba(255,255,255,0)");
  beam.addColorStop(1, "rgba(255,255,255,0.85)");
  ctx.fillStyle = beam;
  ctx.fillRect(cx - 1, 0, 2, gemY - 150);

  // The clear dodecahedron.
  if (gem) {
    const size = 400;
    ctx.drawImage(gem, cx - size / 2, gemY - size / 2, size, size);
  }

  // Bottom fade so text sits on quiet ground.
  const fade = ctx.createLinearGradient(0, 760, 0, CARD_HEIGHT);
  fade.addColorStop(0, "rgba(7,8,10,0)");
  fade.addColorStop(0.35, "rgba(7,8,10,0.9)");
  fade.addColorStop(1, "#07080a");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 760, CARD_WIDTH, CARD_HEIGHT - 760);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Name.
  ctx.fillStyle = INK;
  ctx.font = `300 76px ${SERIF}`;
  const name = (input.name || "Player").toUpperCase();
  ctx.textAlign = "center";
  let nameSize = 76;
  while (ctx.measureText(name).width > CARD_WIDTH - 200 && nameSize > 40) {
    nameSize -= 4;
    ctx.font = `300 ${nameSize}px ${SERIF}`;
  }
  ctx.fillText(name, cx, 850);

  // Thin rule in the dominant color.
  ctx.fillStyle = withAlpha(input.colors[0], 0.8);
  ctx.fillRect(cx - 32, 884, 64, 1);

  // Essence line.
  ctx.fillStyle = INK_2;
  ctx.font = `italic 300 38px ${SERIF}`;
  const lines = wrapLines(input.essence, 40, 4);
  lines.forEach((line, i) => ctx.fillText(line, cx, 940 + i * 52));

  // Hex codes with color chips.
  const chipY = 1160;
  const colW = 280;
  input.colors.forEach((hex, i) => {
    const x = cx + (i - 1) * colW;
    const [r, g, b] = hexToRgb(hex);
    ctx.beginPath();
    ctx.arc(x, chipY, 15, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fill();
    ctx.fillStyle = INK_2;
    ctx.font = `300 22px ${MONO}`;
    ctx.textAlign = "center";
    spacedText(ctx, hex.toUpperCase(), x, chipY + 56, 3);
  });

  // Site mark.
  ctx.fillStyle = "rgba(238, 234, 226, 0.5)";
  ctx.font = `300 20px ${MONO}`;
  spacedText(ctx, CRYSTAL_SITE_MARK.toUpperCase(), cx, CARD_HEIGHT - 56, 5);

  return canvas;
}

export const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png");
  });
