# nano-banana-image

A Claude Code skill for generating images using Google's Gemini API.

## Install

```bash
npx add-skill byrencheema/nano-banana-image
```

Or manually:

```bash
git clone https://github.com/byrencheema/nano-banana-image.git
cd nano-banana-image
./install.sh
```

Then add your API key to your shell config:

```bash
echo 'export GEMINI_API_KEY="your-key"' >> ~/.zshrc
```

Get a key at [Google AI Studio](https://aistudio.google.com/apikey).

## Usage

Once installed, just ask Claude Code to generate images:

> "Generate a logo for my app"
> "Create a 16:9 abstract background"
> "Edit this image to make it more colorful"

## Manual Usage

```bash
cd ~/.claude/skills/nano-banana-image

node scripts/nano_banana.js \
  --prompt "A minimalist logo" \
  --out output.png
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--prompt` | Image description | required |
| `--input` | Input image for editing | none |
| `--out` | Output path | `outputs/output.png` |
| `--aspect` | `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `9:16`, `16:9`, `21:9` | `1:1` |
| `--size` | `1K`, `2K`, `4K` | `1K` |

### Model

Uses `gemini-3-pro-image` (Nano Banana Pro) — high-fidelity text-to-image and image editing, with 2K/4K output.

## Rate Limits

Free tier: ~2-3 images/day (resets midnight PT)
