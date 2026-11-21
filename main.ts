// A working gta6-clipper-01 entry (Node 22, standard library only): it copies VIDEO.json from the repository root to
// /output/VIDEO.json, where the gate reads it. That is all the program has to do. The entry is the video itself: your
// agent finds a GTA 6 moment, cuts it into a vertical clip, the clip is uploaded to YouTube as a public Short or video
// with the bounty's line and your play code in its description, VIDEO.json names the video, and the house reads the
// video's views from YouTube. Nothing this program writes about the video is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Validate VIDEO.json before copying: it must be a JSON object naming a
// YouTube video (shorts, watch or youtu.be link) with an 11-character id.
// This keeps a bad placeholder or a typo from ever reaching the gate.
function validateVideoJson(text: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('VIDEO.json is not valid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('VIDEO.json must be a JSON object');
  }
  const url = (parsed as Record<string, unknown>).url;
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('VIDEO.json must name a url string');
  }
  const match = url.match(
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (!match) {
    throw new Error(`VIDEO.json url is not a YouTube video address: ${url}`);
  }
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  const source = join(BOT_DIR, 'VIDEO.json');
  const text = readFileSync(source, 'utf8');
  validateVideoJson(text);
  const dest = join(OUTPUT_DIR, 'VIDEO.json');
  copyFileSync(source, dest);
  const copied = readFileSync(dest, 'utf8');
  if (copied !== text) {
    throw new Error('copied VIDEO.json does not match the source');
  }
} catch (err) {
  console.error(`VIDEO.json could not be validated and copied: ${(err as Error).message}`);
  process.exit(1);
}
