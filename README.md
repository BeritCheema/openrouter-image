# openrouter-image

A Codex and Claude Code skill for generating and editing images with
`openai/gpt-image-2` through OpenRouter. Transparent PNG requests are processed
locally with `rembg` because GPT Image 2 does not expose native alpha output.

## Install

```bash
git clone https://github.com/BeritCheema/openrouter-image.git
cd openrouter-image
./install.sh
export OPENROUTER_KEY="your-key"
```

The installer adds the skill to both `~/.codex/skills/openrouter-image` and
`~/.claude/skills/openrouter-image`.

## Use

```bash
node scripts/openrouter_image.js \
  --prompt "A minimalist fox logo" \
  --out outputs/fox.png
```

For a transparent PNG:

```bash
node scripts/openrouter_image.js \
  --prompt "A minimalist fox logo" \
  --remove-background \
  --out outputs/fox-transparent.png
```

Run `node scripts/openrouter_image.js --help` for all supported arguments.
