import { NextResponse } from "next/server";

const ROW_1_PATTERN = /^row_1_(\d+)$/;
const ROW_2_PATTERN = /^row_2_(\d+)$/;
const COMBINATION_PATTERN = /^(row_1_\d+)_(row_2_\d+)$/;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function hash(value: string) {
  let current = 0;
  for (let index = 0; index < value.length; index += 1) {
    current = (current * 31 + value.charCodeAt(index)) % 360;
  }
  return current;
}

function colorsFor(id: string) {
  const hue = hash(id);
  return {
    primary: `hsl(${hue} 74% 42%)`,
    secondary: `hsl(${(hue + 48) % 360} 70% 58%)`,
    glow: `hsla(${(hue + 14) % 360} 90% 90% / 0.45)`
  };
}

function renderThumbnailSvg({
  imageId,
  title,
  subtitle
}: {
  imageId: string;
  title: string;
  subtitle: string;
}) {
  const palette = colorsFor(imageId);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="180" viewBox="0 0 260 180" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.primary}" />
      <stop offset="100%" stop-color="${palette.secondary}" />
    </linearGradient>
  </defs>
  <rect width="260" height="180" fill="url(#bg)" rx="10" />
  <circle cx="190" cy="28" r="64" fill="${palette.glow}" />
  <circle cx="72" cy="88" r="35" fill="rgba(255,255,255,0.22)" />
  <rect x="24" y="132" width="212" height="30" rx="8" fill="rgba(255,255,255,0.22)" />
  <text x="24" y="38" fill="white" font-size="20" font-family="Segoe UI, sans-serif" font-weight="700">${escapeXml(
    title
  )}</text>
  <text x="24" y="154" fill="white" font-size="15" font-family="Segoe UI, sans-serif">${escapeXml(subtitle)}</text>
</svg>
`;
}

function renderMainSvg(combinationId: string, modelId: string, jewelleryId: string) {
  const palette = colorsFor(combinationId);
  const modelLabel = modelId.replace("row_1_", "Model ");
  const jewelleryLabel = jewelleryId.replace("row_2_", "Jewellery ");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720" role="img" aria-label="${escapeXml(
    `Generated preview for ${modelLabel} and ${jewelleryLabel}`
  )}">
  <defs>
    <radialGradient id="preview-bg" cx="0.2" cy="0.2" r="1.2">
      <stop offset="0%" stop-color="${palette.secondary}" />
      <stop offset="100%" stop-color="${palette.primary}" />
    </radialGradient>
  </defs>
  <rect width="960" height="720" fill="url(#preview-bg)" />
  <rect x="38" y="38" width="884" height="644" rx="26" fill="rgba(10,24,56,0.45)" stroke="rgba(255,255,255,0.22)" />
  <circle cx="320" cy="330" r="210" fill="rgba(255,255,255,0.2)" />
  <circle cx="320" cy="300" r="122" fill="rgba(255,255,255,0.35)" />
  <rect x="530" y="180" width="308" height="288" rx="14" fill="rgba(255,255,255,0.18)" />
  <text x="88" y="116" fill="white" font-size="44" font-family="Segoe UI, sans-serif" font-weight="700">Generated Campaign Preview</text>
  <text x="88" y="568" fill="white" font-size="34" font-family="Segoe UI, sans-serif" font-style="italic">Elegance that Dazzles</text>
  <text x="88" y="612" fill="white" font-size="30" font-family="Segoe UI, sans-serif">Shine Bright with Our Exclusive Collection</text>
  <text x="88" y="660" fill="white" font-size="25" font-family="Segoe UI, sans-serif" opacity="0.9">Sample Watermark</text>
  <text x="560" y="252" fill="white" font-size="26" font-family="Segoe UI, sans-serif" font-weight="700">${escapeXml(modelLabel)}</text>
  <text x="560" y="300" fill="white" font-size="26" font-family="Segoe UI, sans-serif" font-weight="700">${escapeXml(
    jewelleryLabel
  )}</text>
  <text x="560" y="348" fill="white" font-size="22" font-family="Segoe UI, sans-serif">Endpoint: /images/${escapeXml(
    combinationId
  )}</text>
</svg>
`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const { imageId: rawImageId } = await params;
  const imageId = decodeURIComponent(rawImageId ?? "");
  if (!imageId) {
    return new NextResponse("Missing image id", { status: 400 });
  }

  const combinationMatch = imageId.match(COMBINATION_PATTERN);
  const row1Match = imageId.match(ROW_1_PATTERN);
  const row2Match = imageId.match(ROW_2_PATTERN);

  let svg = "";
  if (combinationMatch) {
    const modelId = combinationMatch[1];
    const jewelleryId = combinationMatch[2];
    svg = renderMainSvg(imageId, modelId, jewelleryId);
  } else if (row1Match) {
    svg = renderThumbnailSvg({
      imageId,
      title: `Model ${row1Match[1]}`,
      subtitle: imageId
    });
  } else if (row2Match) {
    svg = renderThumbnailSvg({
      imageId,
      title: `Jewellery ${row2Match[1]}`,
      subtitle: imageId
    });
  } else {
    return new NextResponse("Image id not supported", { status: 404 });
  }

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
