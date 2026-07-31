const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = path.resolve(__dirname, "../public/icons/icon.svg");
const OUT = path.resolve(__dirname, "../public/icons");

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function main() {
  for (const { name, size } of sizes) {
    await sharp(SRC)
      .resize(size, size)
      .png()
      .toFile(path.join(OUT, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
