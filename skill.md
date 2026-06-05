---
name: nano-banana-image
description: Generate and edit images using Google's Nano Banana Pro (Gemini 3 Pro Image) model.
---

# nano-banana-image

Generate and edit images using Google's Nano Banana Pro (`gemini-3-pro-image`) model.

## When to use this skill

Use this skill when the user wants to:
- Generate images from text prompts
- Edit or transform existing images with instructions
- Create logos, illustrations, product photos, or any visual content

## Usage

```bash
cd ~/.claude/skills/nano-banana-image
node scripts/nano_banana.js [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--prompt` | Text prompt describing the image | required |
| `--input` | Path to input image for editing | none |
| `--out` | Output path for generated image | `outputs/output.png` |
| `--aspect` | Aspect ratio: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9` | `1:1` |
| `--size` | Resolution: `1K`, `2K`, `4K` | `1K` |

### Model

Uses `gemini-3-pro-image` (Nano Banana Pro) for all generation — high-fidelity text-to-image and image editing, with 2K/4K output.

### Examples

**Text to image:**
```bash
node scripts/nano_banana.js \
  --prompt "A clean minimalist ninja logo, bold outline, white background" \
  --out outputs/logo.png
```

**Edit existing image:**
```bash
node scripts/nano_banana.js \
  --input inputs/room.png \
  --prompt "Restyle this room as modern Japanese minimalism" \
  --out outputs/room_edited.png
```

**High quality widescreen at 2K:**
```bash
node scripts/nano_banana.js \
  --aspect 16:9 \
  --size 2K \
  --prompt "A cinematic product photo of a smartwatch on a reflective surface" \
  --out outputs/product.png
```

## Requirements

- Node.js 18+
- `GEMINI_API_KEY` environment variable (get one at [Google AI Studio](https://aistudio.google.com/apikey))

## Setup

```bash
cd ~/.claude/skills/nano-banana-image
bun install
export GEMINI_API_KEY="your-key-here"
```
