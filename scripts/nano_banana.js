#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const MODEL = "gemini-3-pro-image";

const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function parseArgs(args) {
  const result = { prompt: null, input: null, out: "outputs/output.png", aspect: "1:1", size: "1K" };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (["--prompt", "--input", "--out", "--aspect", "--size"].includes(arg) && args[i + 1]) {
      result[arg.slice(2)] = args[++i];
    }
  }
  return result;
}

function fail(error) {
  console.log(JSON.stringify({ ok: false, error }));
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.prompt) fail("Missing --prompt");
  if (!process.env.GEMINI_API_KEY) fail("Missing GEMINI_API_KEY environment variable");

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const contents = [];
  if (args.input) {
    contents.push({
      inlineData: {
        mimeType: MIME_TYPES[path.extname(args.input).toLowerCase()] || "image/png",
        data: fs.readFileSync(args.input).toString("base64"),
      },
    });
  }
  contents.push({ text: args.prompt });

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: contents }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: args.aspect, imageSize: args.size },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) fail("No image generated. Try a different prompt.");

    const outDir = path.dirname(args.out);
    if (outDir) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(args.out, Buffer.from(part.inlineData.data, "base64"));

    console.log(JSON.stringify({
      ok: true,
      outFiles: [args.out],
      prompt: args.prompt.substring(0, 100) + (args.prompt.length > 100 ? "..." : ""),
    }));
  } catch (error) {
    fail(error.message);
  }
}

main();
