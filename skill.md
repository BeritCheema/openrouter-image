---
name: nano-banana-image
description: Generate and edit images using Google's Gemini image generation models.
---

# nano-banana-image

Generate and edit images using Google's Gemini image generation models.

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
| `--model` | `flash` (fast) or `pro` (higher quality) | `flash` |
| `--prompt` | Text prompt describing the image | required |
| `--input` | Path to input image for editing | none |
| `--out` | Output path for generated image | `outputs/output.png` |
| `--aspect` | Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:4` | `1:1` |

### Models

| Model | API Name | Best for |
|-------|----------|----------|
| `flash` | `gemini-3.1-flash-image-preview` | Fast generation, image editing |
| `pro` | `gemini-3-pro-image-preview` | High-fidelity, complex prompts |

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

**High quality widescreen:**
```bash
node scripts/nano_banana.js \
  --model pro \
  --aspect 16:9 \
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
