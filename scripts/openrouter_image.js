#!/usr/bin/env node

import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MODEL = "openai/gpt-image-2";
const API_URL = "https://openrouter.ai/api/v1/images";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.dirname(SCRIPT_DIR);
const PYTHON = path.join(SKILL_DIR, ".venv", "bin", "python");
const ASPECTS = new Set(["auto", "1:1", "3:2", "2:3", "4:3", "3:4", "16:9", "9:16", "21:9"]);
const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};
const TRANSPARENCY_PATTERN = /\b(transparent background|background transparent|remove (?:the )?background|background removal|backgroundless|no background|cut[ -]?out|transparency)\b/i;

function fail(error, details) {
  console.error(JSON.stringify({ ok: false, error, ...(details ? { details } : {}) }));
  process.exit(1);
}

function usage() {
  return `Usage: node scripts/openrouter_image.js --prompt <text> [options]

Options:
  --prompt <text>            Image generation or editing instruction (required)
  --input <path>             Reference image; repeat for multiple images
  --out <path>               Output path (default: outputs/output.png)
  --aspect <ratio>           auto, 1:1, 3:2, 2:3, 4:3, 3:4, 16:9, 9:16, or 21:9
  --remove-background       Create a true transparent PNG with local processing
  --dry-run                 Print the request without calling OpenRouter
  --help                    Show this help`;
}

function parseArgs(argv) {
  const result = {
    prompt: null,
    inputs: [],
    out: "outputs/output.png",
    aspect: null,
    removeBackground: false,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }
    if (arg === "--remove-background") {
      result.removeBackground = true;
      continue;
    }
    if (arg === "--dry-run") {
      result.dryRun = true;
      continue;
    }
    if (["--prompt", "--input", "--out", "--aspect"].includes(arg)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) fail(`Missing value for ${arg}`);
      index += 1;
      if (arg === "--input") result.inputs.push(value);
      else result[arg.slice(2)] = value;
      continue;
    }
    fail(`Unknown argument: ${arg}`);
  }

  if (!result.prompt) fail("Missing --prompt");
  if (result.aspect && !ASPECTS.has(result.aspect)) {
    fail(`Unsupported aspect ratio: ${result.aspect}`, `Choose one of: ${[...ASPECTS].join(", ")}`);
  }
  if (result.inputs.length > 16) fail("GPT Image 2 accepts at most 16 input images");
  result.removeBackground ||= TRANSPARENCY_PATTERN.test(result.prompt);
  if (path.extname(result.out).toLowerCase() !== ".png") {
    fail("GPT Image 2 output requires an --out path ending in .png");
  }
  for (const input of result.inputs) {
    if (!fs.existsSync(input)) fail(`Input image not found: ${input}`);
  }
  return result;
}

function inputReference(inputPath) {
  const extension = path.extname(inputPath).toLowerCase();
  const mediaType = MIME_TYPES[extension];
  if (!mediaType) fail(`Unsupported input image type: ${extension || "none"}`);
  const data = fs.readFileSync(inputPath).toString("base64");
  return {
    type: "image_url",
    image_url: { url: `data:${mediaType};base64,${data}` },
  };
}

function buildPrompt(args) {
  if (!args.removeBackground) return args.prompt;
  return `${args.prompt}\n\nOutput preparation requirement: preserve the complete foreground subject with clean, distinct edges. Isolate it against one perfectly flat, evenly lit, solid chroma-green (#00FF00) background. Do not add a checkerboard pattern, gradient, texture, scenery, border, or green reflection. Keep all subject details intact.`;
}

function buildRequest(args) {
  const request = { model: MODEL, prompt: buildPrompt(args), n: 1 };
  if (args.aspect) request.aspect_ratio = args.aspect;
  if (args.inputs.length > 0) request.input_references = args.inputs.map(inputReference);
  return request;
}

async function removeBackground(inputPath, outputPath) {
  if (!fs.existsSync(PYTHON)) {
    fail("Local background remover is not installed", "Run ./install.sh from the skill directory");
  }
  try {
    await execFileAsync(PYTHON, [
      path.join(SCRIPT_DIR, "remove_background.py"),
      "--input",
      inputPath,
      "--out",
      outputPath,
    ]);
  } catch (error) {
    fail("Local background removal failed", error.stderr?.trim() || error.message);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const request = buildRequest(args);

  if (args.dryRun) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: true,
      request: { ...request, input_references: request.input_references?.map(() => "<base64 image>") },
      out: args.out,
      localBackgroundRemoval: args.removeBackground,
    }, null, 2));
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) fail("Missing OPENROUTER_API_KEY environment variable");

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/byrencheema/nano-banana-image",
        "X-Title": "OpenRouter Image Skill",
      },
      body: JSON.stringify(request),
    });
  } catch (error) {
    fail("Could not reach OpenRouter", error.message);
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    fail(`OpenRouter request failed (${response.status})`, result?.error?.message || result || response.statusText);
  }
  if (!Array.isArray(result?.data) || result.data.length === 0) {
    fail("OpenRouter returned no images");
  }

  const outFiles = [];
  for (let index = 0; index < result.data.length; index += 1) {
    const image = result.data[index];
    if (!image?.b64_json) fail(`OpenRouter image ${index + 1} had no base64 data`);
    const outputPath = result.data.length === 1
      ? args.out
      : `${args.out.slice(0, -path.extname(args.out).length)}-${index + 1}${path.extname(args.out)}`;
    fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });

    if (args.removeBackground) {
      const tempPath = `${outputPath}.opaque.png`;
      fs.writeFileSync(tempPath, Buffer.from(image.b64_json, "base64"));
      try {
        await removeBackground(tempPath, outputPath);
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } else {
      fs.writeFileSync(outputPath, Buffer.from(image.b64_json, "base64"));
    }
    outFiles.push(outputPath);
  }

  console.log(JSON.stringify({
    ok: true,
    outFiles,
    model: MODEL,
    costUsd: result.usage?.cost ?? null,
    localBackgroundRemoval: args.removeBackground,
  }));
}

main().catch((error) => fail("Unexpected error", error.message));
