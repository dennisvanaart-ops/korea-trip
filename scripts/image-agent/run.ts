#!/usr/bin/env tsx
/**
 * run.ts — Image curation agent
 *
 * Usage:  npm run image:scan
 *
 * For every trip item in config.ts it:
 *   1. Runs up to 3 Wikimedia Commons search queries
 *   2. Validates + scores each candidate
 *   3. Keeps the top-3 (high + medium only)
 *   4. Writes the full manifest to output/image-candidates.json
 *
 * NEVER downloads images automatically.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { ITEMS, preferredFilename } from "./config.js";
import { searchAllQueries } from "./search.js";
import { validateCandidate, rankCandidates } from "./validate.js";
import type { ImageItemResult, ValidatedCandidate } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "image-candidates.json");

const MAX_SHORTLIST = 3;

// ── Colour helpers ────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
};

function badge(confidence: "high" | "medium" | "low"): string {
  if (confidence === "high") return `${C.green}[HIGH]${C.reset}`;
  if (confidence === "medium") return `${C.yellow}[MED]${C.reset}`;
  return `${C.red}[LOW]${C.reset}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n${C.bold}${C.cyan}Korea Trip — Image Curation Agent${C.reset}`);
  console.log(`${C.dim}Searching Wikimedia Commons for ${ITEMS.length} items…${C.reset}\n`);

  const results: ImageItemResult[] = [];

  let statsHigh = 0;
  let statsMedium = 0;
  let statsNone = 0;

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const filename = preferredFilename(item);

    process.stdout.write(
      `${C.bold}[${String(i + 1).padStart(2, "0")}/${ITEMS.length}]${C.reset} ` +
      `${item.name} ${C.dim}(${item.type}, ${item.city})${C.reset} … `
    );

    // 1. Search
    const raw = await searchAllQueries(item.searchQueries);

    // 2. Validate all
    const validated: ValidatedCandidate[] = raw.map((c) =>
      validateCandidate(c, item)
    );

    // 3. Rank + split
    const { shortlist, rejected } = rankCandidates(validated);

    // 4. Take top-3 from shortlist
    const top = shortlist.slice(0, MAX_SHORTLIST);

    // 5. Determine recommendedIndex
    const firstHigh = top.findIndex((c) => c.confidence === "high");
    const recommendedIndex = firstHigh >= 0 ? firstHigh : null;
    const needsHumanReview = recommendedIndex === null;

    // 6. Print summary line
    const highCount = top.filter((c) => c.confidence === "high").length;
    const medCount = top.filter((c) => c.confidence === "medium").length;

    if (top.length === 0) {
      process.stdout.write(`${C.red}✗ no candidates${C.reset}\n`);
      statsNone++;
    } else {
      process.stdout.write(
        `${C.green}✓${C.reset} ${top.length} candidates ` +
        `(${highCount} high, ${medCount} medium)\n`
      );
      if (highCount > 0) statsHigh++;
      else statsMedium++;
    }

    // 7. Print per-candidate detail
    for (const [j, c] of top.entries()) {
      const star = j === recommendedIndex ? " ★" : "  ";
      console.log(
        `   ${star}${badge(c.confidence)} ${C.dim}${c.title ?? c.url.split("/").pop() ?? c.url}${C.reset}`
      );
      console.log(`       ${C.dim}${c.reason}${C.reset}`);
    }

    // 8. Log rejected (debug)
    if (rejected.length > 0) {
      console.log(
        `   ${C.dim}↳ rejected ${rejected.length}: ` +
        rejected.map((c) => c.title ?? "untitled").join(", ") +
        `${C.reset}`
      );
    }

    results.push({
      id: item.id,
      name: item.name,
      type: item.type,
      preferredFilename: filename,
      candidates: top,
      recommendedIndex,
      needsHumanReview,
    });
  }

  // ── Write manifest ──────────────────────────────────────────────────────────
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf-8");

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log(`\n${C.bold}Summary${C.reset}`);
  console.log(`  ${C.green}High-confidence pick found:${C.reset}  ${statsHigh}`);
  console.log(`  ${C.yellow}Medium only (review needed):${C.reset} ${statsMedium}`);
  console.log(`  ${C.red}No candidates found:${C.reset}         ${statsNone}`);
  console.log(`\n  Manifest written to: ${C.cyan}${OUTPUT_FILE}${C.reset}\n`);
  console.log(
    `${C.dim}Next step: review the JSON, then copy chosen URLs to public/images/ manually.${C.reset}\n`
  );
}

run().catch((err) => {
  console.error(`\n${C.red}Fatal error:${C.reset}`, err);
  process.exit(1);
});
