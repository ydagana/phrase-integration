#!/usr/bin/env node

/**
 * Transform Phrase pulled translations (react_simple_json) into
 * descriptor-style JSON that formatjs expects.
 *
 * - Reads all JSON files in frontend/lang/
 * - Skips en-GB.json (keeps it as-is)
 * - Skips files that are already descriptor-style
 * - Overwrites transformed files in place
 */

const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../frontend/lang");

if (!fs.existsSync(dir)) {
  console.error(`❌ Directory not found: ${dir}`);
  process.exit(1);
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

files.forEach((file) => {
  if (file === "en-GB.json") {
    console.log(`ℹ️ Skipping ${file}`);
    return;
  }

  const filePath = path.join(dir, file);
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const firstVal = Object.values(raw)[0];
  if (
    firstVal &&
    typeof firstVal === "object" &&
    "defaultMessage" in firstVal
  ) {
    console.log(`ℹ️ Already descriptor-style, skipping ${file}`);
    return;
  }

  // Transform: { id: "string" } → { id: { defaultMessage: "string" } }
  const descriptors = Object.fromEntries(
    Object.entries(raw).map(([id, msg]) => [id, { defaultMessage: msg }])
  );

  fs.writeFileSync(filePath, JSON.stringify(descriptors, null, 2));
  console.log(`✅ Transformed ${file}`);
});

