import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

test("exports the calculator at the GitHub Pages base path", () => {
  assert.match(html, /<title>R4FS Forge Calculator<\/title>/);
  assert.match(html, /\/r4fs-forge-calculator\/_next\//);
  assert.match(html, /\/r4fs-forge-calculator\/favicon\.svg/);
});

test("contains no authentication or ChatGPT hosting routes", () => {
  assert.doesNotMatch(html, /signin-with-chatgpt/i);
  assert.doesNotMatch(html, /signout-with-chatgpt/i);
  assert.doesNotMatch(html, /chatgpt\.site/i);
});
