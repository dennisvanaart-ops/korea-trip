#!/usr/bin/env tsx
/**
 * run.ts — Image curation agent
 *
 * Usage:  npm run image:scan
 *
 * For every trip item in config.ts it:
 *   1. Runs search queries using the item's searchStrategy:
 *      - "wikimedia": Wikimedia Commons only (landmarks, transport)
 *      - "web":       DuckDuckGo + og:image (cafés, restaurants, small hotels)
 *      - "both":      Both sources combined
 *   2. Validates + scores each candidate
 *   3. Keeps the top-3 (high + medium only; low is logged but excluded)
 *   4. Writes the full manifest to output/image-candidates.json
 *
 * Optional env vars:
 *   NAVER_CLIENT_ID + NAVER_CLIENT_SECRET  → enables Naver Image API (Korean venues)
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
  reset: "\x1b[0m",   bold: "\x1b[1m",  dim: "\x1b[2m",
  green: "\x1b[32m",  yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m",
  blue: "\x1b[34m",   magenta: "\x1b[35m",
};

function badge(confidence: "high" | "medium" | "low") {
  if (confidence === "high")   return `${C.green}[HIGH]${C.reset}`;
  if (confidence === "medium") return `${C.yellow}[MED] ${C.reset}`;
  return `${C.red}[LOW] ${C.reset}`;
}

function srcBadge(s: string) {
  if (s === "wikimedia") return `${C.blue}[wiki]${C.reset}`;
  if (s === "official")  return `${C.green}[official]${C.reset}`;
  if (s === "naver")     return `${C.cyan}[naver]${C.reset}`;
  if (s === "instagram") return `${C.magenta}[ig]${C.reset}`;
  if (s === "booking")   return `${C.cyan}[booking]${C.reset}`;
  return `${C.dim}[${s}]${C.reset}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const naverEnabled = !!process.env.NAVER_CLIENT_ID;

  console.log(`\n${C.bold}${C.cyan}Korea Trip — Image Curation Agent${C.reset}`);
  console.log(`${C.dim}Sources: Wikimedia Commons + DuckDuckGo/og:image${
    naverEnabled ? " + Naver API" : " (set NAVER_CLIENT_ID for Naver API)"
  }${C.reset}`);
  console.log(`${C.dim}Scanning ${ITEMS.length} items…${C.reset}\n`);

  const results: ImageItemResult[] = [];
  let statsHigh = 0, statsMedium = 0, statsNone = 0;

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const filename = preferredFilename(item);

    process.stdout.write(
      `${C.bold}[${String(i + 1).padStart(2, "0")}/${ITEMS.length}]${C.reset} ` +
      `${item.name} ${C.dim}(${item.type}, ${item.city}, strategy:${item.searchStrategy})${C.reset} … `
    );

    // 1. Search using item strategy
    const raw = await searchAllQueries(item.searchQueries, item.searchStrategy);

    // 2. Validate all
    const validated: ValidatedCandidate[] = raw.map((c) => validateCandidate(c, item));

    // 3. Rank + split
    const { shortlist, rejected } = rankCandidates(validated);

    // 4. Take top-3
    const top = shortlist.slice(0, MAX_SHORTLIST);

    // 5. recommendedIndex: first high candidate
    const firstHigh = top.findIndex((c) => c.confidence === "high");
    const recommendedIndex = firstHigh >= 0 ? firstHigh : null;
    const needsHumanReview = recommendedIndex === null;

    // 6. Print summary
    const highCount = top.filter((c) => c.confidence === "high").length;
    const medCount  = top.filter((c) => c.confidence === "medium").length;

    if (top.length === 0) {
      process.stdout.write(`${C.red}✗ no candidates${C.reset}\n`);
      statsNone++;
    } else {
      process.stdout.write(
        `${C.green}✓${C.reset} ${top.length} candidates ` +
        `(${highCount} high, ${medCount} medium)\n`
      );
      if (highCount > 0) statsHigh++; else statsMedium++;
    }

    // 7. Per-candidate detail
    for (const [j, c] of top.entries()) {
      const star = j === recommendedIndex ? " ★" : "  ";
      const title = c.title ?? c.url.split("/").pop() ?? c.url;
      console.log(`   ${star}${badge(c.confidence)} ${srcBadge(c.sourceType)} ${C.dim}${title.slice(0, 72)}${C.reset}`);
      console.log(`       ${C.dim}${c.reason}${C.reset}`);
      if (c.sourceType !== "wikimedia") {
        console.log(`       ${C.yellow}⚠ ${c.licenseOrUsageNote}${C.reset}`);
      }
    }

    // 8. Rejected (debug only)
    if (rejected.length > 0) {
      console.log(`   ${C.dim}↳ rejected ${rejected.length}: ${rejected.map((c) => c.title?.slice(0, 40) ?? "?").join(", ")}${C.reset}`);
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
  console.log(`  ${C.green}High-confidence pick:${C.reset}       ${statsHigh}`);
  console.log(`  ${C.yellow}Medium only (needs review):${C.reset} ${statsMedium}`);
  console.log(`  ${C.red}No candidates found:${C.reset}        ${statsNone}`);
  console.log(`\n  Manifest → ${C.cyan}${OUTPUT_FILE}${C.reset}`);
  console.log(`${C.dim}  Non-Wikimedia images need usage-rights verification before deployment.${C.reset}\n`);
}

run().catch((err) => {
  console.error(`\n${C.red}Fatal:${C.reset}`, err);
  process.exit(1);
});
