#!/bin/bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
CODEX_SKILL_DIR="${CODEX_HOME:-$HOME/.codex}/skills/openrouter-image"
CLAUDE_SKILL_DIR="$HOME/.claude/skills/openrouter-image"

if ! command -v uv >/dev/null 2>&1; then
  echo "Error: uv is required for the local background-removal environment."
  echo "Install uv from https://docs.astral.sh/uv/ and rerun this installer."
  exit 1
fi

install_skill() {
  local target_dir="$1"
  local host_name="$2"

  echo "Installing openrouter-image for $host_name to $target_dir"
  mkdir -p "$target_dir"
  cp -R "$SOURCE_DIR/SKILL.md" "$SOURCE_DIR/package.json" "$SOURCE_DIR/pyproject.toml" \
    "$SOURCE_DIR/scripts" "$SOURCE_DIR/inputs" "$SOURCE_DIR/outputs" "$SOURCE_DIR/agents" "$target_dir"

  uv venv --clear --python 3.13 "$target_dir/.venv"
  UV_PROJECT_ENVIRONMENT="$target_dir/.venv" uv sync --project "$target_dir"
}

install_skill "$CODEX_SKILL_DIR" "Codex"
install_skill "$CLAUDE_SKILL_DIR" "Claude Code"

echo "Installed successfully for Codex and Claude Code."
echo "Set OPENROUTER_API_KEY before generating images."
