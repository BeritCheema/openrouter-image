---
name: openrouter-image
description: Generate and edit images with OpenAI GPT Image 2 through OpenRouter, including automatic local background removal for transparent PNG cutouts. Use when Codex needs to create an image from a prompt, edit one or more reference images, produce logos or product assets, or remove an image background.
---

# OpenRouter Image

Use the bundled CLI for image generation and editing. Always use the fixed model
`openai/gpt-image-2`; do not offer model or quality choices.

## Generate or edit

Run from the skill directory:

```bash
node scripts/openrouter_image.js \
  --prompt "A minimalist ceramic fox logo on an ivory background" \
  --out outputs/fox.png
```

To edit an image, add one or more repeatable `--input` arguments:

```bash
node scripts/openrouter_image.js \
  --input inputs/room.png \
  --prompt "Restyle this room as modern Japanese minimalism" \
  --out outputs/room-edited.png
```

Use `--aspect` only when the user specifies a ratio. Supported values are `auto`,
`1:1`, `3:2`, `2:3`, `4:3`, `3:4`, `16:9`, `9:16`, and `21:9`.

Use `--dry-run` to inspect the request without making a billed API call.

## Transparent backgrounds

When the user requests background removal, a cutout, or true transparency, pass
`--remove-background` and make `--out` a `.png` file:

```bash
node scripts/openrouter_image.js \
  --input inputs/product.jpg \
  --prompt "Preserve the product exactly and isolate it from the background" \
  --remove-background \
  --out outputs/product-cutout.png
```

The CLI asks GPT Image 2 for a clean isolated subject, then runs the bundled local
`rembg` processor to create a real alpha channel. It also detects explicit phrases
such as "transparent background" or "remove the background" in the prompt, but
prefer the flag when transparency is required.

After generation, inspect the output. Pay extra attention to hair, glass, smoke,
shadows, holes, and translucent materials because local segmentation may need a
revised source render.

## Requirements

- Node.js 18 or newer
- `OPENROUTER_KEY`
- Python 3.11–3.13 for local background removal
- The local environment created by `./install.sh`

Run `./install.sh` once before first use. The background-removal model downloads on
its first transparent-output request and is cached locally by `rembg`.

The CLI returns JSON containing the output paths, fixed model name, OpenRouter's
reported request cost when available, and whether local background removal ran.
