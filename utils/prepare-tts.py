#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Dict, Tuple


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
PROMPT_FILE = SCRIPT_DIR / "TTS-Prep-Prompt.md"
DEFAULT_OUTPUT = SCRIPT_DIR / "tts_prep_output.md"
DEFAULTS = {
    "model": "gpt-5.4",
    "reasoning_effort": "high",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_file")
    parser.add_argument("output_file", nargs="?", default=str(DEFAULT_OUTPUT))
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()

def parse_prompt_file(path: Path) -> Tuple[Dict[str, str], str]:
    text = path.read_text(encoding="utf-8")
    config = dict(DEFAULTS)
    instructions = text.strip()

    if text.startswith("---\n"):
        lines = text.splitlines()
        end_index = None
        for index in range(1, len(lines)):
            if lines[index].strip() == "---":
                end_index = index
                break
        if end_index is None:
            raise SystemExit(f"Invalid frontmatter in {path}")

        for line in lines[1:end_index]:
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or ":" not in line:
                continue
            key, value = line.split(":", 1)
            config[key.strip()] = value.strip().strip("'\"")
        instructions = "\n".join(lines[end_index + 1 :]).strip()

    return config, instructions


def normalize_output_text(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```") and stripped.endswith("```"):
        lines = stripped.splitlines()
        if len(lines) >= 3:
            stripped = "\n".join(lines[1:-1]).strip()
    return stripped


def run_codex_prep(model: str, reasoning_effort: str, prompt_text: str) -> str:
    with tempfile.NamedTemporaryFile("w+", encoding="utf-8", delete=False) as handle:
        output_path = Path(handle.name)

    try:
        command = [
            "codex",
            "exec",
            "-m",
            model,
            "--sandbox",
            "read-only",
            "--color",
            "never",
            "--ephemeral",
            "-C",
            str(REPO_ROOT),
            "-o",
            str(output_path),
            "-",
        ]
        if reasoning_effort:
            command.extend(["-c", f'model_reasoning_effort="{reasoning_effort}"'])

        result = subprocess.run(
            command,
            input=prompt_text,
            text=True,
            capture_output=True,
            check=False,
        )
    finally:
        pass

    if result.returncode != 0:
        details = result.stderr.strip() or result.stdout.strip() or f"codex exec exited with {result.returncode}"
        output_path.unlink(missing_ok=True)
        raise SystemExit(f"Codex prep failed: {details}")

    prepared = output_path.read_text(encoding="utf-8")
    output_path.unlink(missing_ok=True)
    normalized = normalize_output_text(prepared)
    if not normalized:
        raise SystemExit("Codex prep returned empty output.")
    return normalized


def main() -> int:
    args = parse_args()
    input_path = Path(args.input_file).resolve()
    output_path = Path(args.output_file).resolve()

    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")
    if not PROMPT_FILE.exists():
        raise SystemExit(f"Prompt file not found: {PROMPT_FILE}")

    config, instructions = parse_prompt_file(PROMPT_FILE)
    source_text = input_path.read_text(encoding="utf-8")
    if not source_text.strip():
        raise SystemExit("Input file is empty.")

    print(f"Input: {input_path}")
    print(f"Prompt: {PROMPT_FILE}")
    print(f"Model: {config.get('model', DEFAULTS['model'])}")
    print(f"Reasoning: {config.get('reasoning_effort', DEFAULTS['reasoning_effort'])}")
    print(f"Output: {output_path}")

    if args.dry_run:
        return 0

    prompt_text = (
        f"{instructions}\n\n"
        "Return only the transformed text, with no introduction, no explanation, and no code fences.\n\n"
        "<source_markdown>\n"
        f"{source_text.rstrip()}\n"
        "</source_markdown>\n"
    )
    prepared_text = run_codex_prep(
        config.get("model", DEFAULTS["model"]),
        config.get("reasoning_effort", DEFAULTS["reasoning_effort"]).strip(),
        prompt_text,
    )
    output_path.write_text(prepared_text.rstrip() + "\n", encoding="utf-8")

    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
