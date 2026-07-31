const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.resolve(__dirname, "../public/screenshots");

function gradientBg(w, h) {
  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06060A"/>
      <stop offset="55%" stop-color="#12070f"/>
      <stop offset="100%" stop-color="#1d0916"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff0069"/>
      <stop offset="100%" stop-color="#ff3385"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#ff0069" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ff0069" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <circle cx="${w / 2}" cy="${h / 2}" r="${Math.round(Math.min(w, h) * 0.55)}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${w}" height="4" fill="url(#accent)"/>`;
}

function logo(x, y, size) {
  const r = size * 0.28;
  return `
  <rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" rx="${r}" fill="url(#accent)"/>
  <text x="${x}" y="${y + 2}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="900" font-size="${size * 0.52}" fill="#ffffff">C</text>`;
}

function narrowSvg() {
  const w = 390;
  const h = 844;
  const cx = w / 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${gradientBg(w, h)}
${logo(cx, 250, 130)}
<text x="${cx}" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="42" fill="#ffffff">Co-Patner</text>
<text x="${cx}" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-weight="400" font-size="17" fill="#a7a7b8">Meet real people face to face</text>
<rect x="60" y="470" width="270" height="46" rx="23" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)"/>
<circle cx="88" cy="493" r="12" fill="#22c55e"/>
<text x="110" y="498" font-family="Arial, sans-serif" font-size="16" fill="#e5e7eb">1200+ online now</text>
${[0, 1, 2, 3].map((i) => {
  const tx = 67 + i * 70;
  return `<rect x="${tx}" y="580" width="56" height="74" rx="14" fill="${i % 2 === 0 ? "rgba(255,0,105,0.25)" : "rgba(255,0,105,0.15)"}" stroke="rgba(255,255,255,0.1)"/>`;
}).join("")}
<rect x="66" y="690" width="258" height="52" rx="26" fill="url(#accent)"/>
<text x="${cx}" y="721" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="700" font-size="17" fill="#ffffff">Start chatting</text>
</svg>`;
}

function wideSvg() {
  const w = 1280;
  const h = 800;
  const titleX = 130;
  const titleY = 250;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${gradientBg(w, h)}
${logo(titleX + 60, titleY, 120)}
<text x="${titleX + 150}" y="${titleY - 5}" font-family="Arial, sans-serif" font-weight="800" font-size="58" fill="#ffffff">Co-Patner</text>
<text x="${titleX + 150}" y="${titleY + 35}" font-family="Arial, sans-serif" font-weight="400" font-size="21" fill="#a7a7b8">Live random video chat with real people</text>
<circle cx="${titleX + 25}" cy="380" r="6" fill="#22c55e"/>
<text x="${titleX + 45}" y="386" font-family="Arial, sans-serif" font-size="19" fill="#e5e7eb">Free &amp; anonymous</text>
<circle cx="${titleX + 25}" cy="425" r="6" fill="#22c55e"/>
<text x="${titleX + 45}" y="431" font-family="Arial, sans-serif" font-size="19" fill="#e5e7eb">180+ countries</text>
<circle cx="${titleX + 25}" cy="470" r="6" fill="#22c55e"/>
<text x="${titleX + 45}" y="476" font-family="Arial, sans-serif" font-size="19" fill="#e5e7eb">No videos stored</text>
<rect x="${titleX}" y="530" width="260" height="60" rx="30" fill="url(#accent)"/>
<text x="${titleX + 130}" y="565" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="700" font-size="20" fill="#ffffff">Start chatting</text>
<rect x="630" y="120" width="270" height="260" rx="18" fill="rgba(255,0,105,0.22)" stroke="rgba(255,255,255,0.1)"/>
<rect x="920" y="120" width="270" height="260" rx="18" fill="rgba(255,0,105,0.12)" stroke="rgba(255,255,255,0.1)"/>
<rect x="630" y="400" width="270" height="260" rx="18" fill="rgba(255,0,105,0.12)" stroke="rgba(255,255,255,0.1)"/>
<rect x="920" y="400" width="270" height="260" rx="18" fill="rgba(255,0,105,0.22)" stroke="rgba(255,255,255,0.1)"/>
<rect x="820" y="342" width="180" height="86" rx="43" fill="#06060A" stroke="rgba(255,255,255,0.15)"/>
<text x="910" y="395" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-weight="700" font-size="26" fill="#ffffff">▶</text>
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = [
    { name: "screenshot-narrow.png", svg: narrowSvg() },
    { name: "screenshot-wide.png", svg: wideSvg() },
  ];
  for (const { name, svg } of jobs) {
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, name));
    const meta = await sharp(path.join(OUT, name)).metadata();
    console.log(`Generated ${name} (${meta.width}x${meta.height})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
