#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple
from urllib import error, request


SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
PROMPT_FILE = SCRIPT_DIR / "TTS-Prompt.md"
DEFAULT_INPUT = SCRIPT_DIR / "tts_prep_output.md"
DEFAULTS = {
    "model": "gpt-4o-mini-tts",
    "voice": "alloy",
    "speed": "1.0",
    "response_format": "mp3",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_file", nargs="?", default=str(DEFAULT_INPUT))
    parser.add_argument("output_file", nargs="?")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--max-chars", type=int, default=5000)
    return parser.parse_args()


def load_dotenv_key(key: str) -> str | None:
    env_path = REPO_ROOT / ".env"
    if not env_path.exists():
        return None

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        current_key, value = line.split("=", 1)
        if current_key.strip() != key:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        return value
    return None


def load_api_key() -> str:
    api_key = os.environ.get("OPENAI_API_KEY") or load_dotenv_key("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit(f"OPENAI_API_KEY is not set and was not found in {REPO_ROOT / '.env'}")
    return api_key


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


def split_into_chunks(text: str, max_chars: int) -> List[str]:
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", text.strip()) if part.strip()]
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    def flush() -> None:
        nonlocal current, current_len
        if current:
            chunks.append("\n\n".join(current))
            current = []
            current_len = 0

    def append_piece(piece: str) -> None:
        nonlocal current_len
        extra = 2 if current else 0
        if current and current_len + extra + len(piece) > max_chars:
            flush()
        current.append(piece)
        current_len += len(piece) if len(current) == 1 else len(piece) + 2

    for paragraph in paragraphs:
        if len(paragraph) <= max_chars:
            append_piece(paragraph)
            continue

        sentences = [part.strip() for part in re.split(r"(?<=[.!?…])\s+", paragraph) if part.strip()]
        for sentence in sentences:
            if len(sentence) <= max_chars:
                append_piece(sentence)
                continue

            for start in range(0, len(sentence), max_chars):
                append_piece(sentence[start : start + max_chars].strip())

    flush()
    return chunks


def request_speech(
    api_key: str,
    payload: Dict[str, str],
    output_path: Path,
) -> None:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        "https://api.openai.com/v1/audio/speech",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(req) as response:
            output_path.write_bytes(response.read())
    except error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace").strip()
        message = f"OpenAI API error {exc.code}"
        if error_body:
            message = f"{message}: {error_body}"
        raise SystemExit(message) from exc
    except error.URLError as exc:
        raise SystemExit(f"Network error: {exc}") from exc


def concat_audio(parts: List[Path], output_path: Path) -> None:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", delete=False) as handle:
        for part in parts:
            handle.write(f"file '{part}'\n")
        concat_path = Path(handle.name)

    try:
        subprocess.run(
            [
                "ffmpeg",
                "-loglevel",
                "error",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_path),
                "-c",
                "copy",
                str(output_path),
            ],
            check=True,
        )
    finally:
        concat_path.unlink(missing_ok=True)


def main() -> int:
    args = parse_args()
    input_path = Path(args.input_file).resolve()
    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")

    if not PROMPT_FILE.exists():
        raise SystemExit(f"Prompt file not found: {PROMPT_FILE}")

    config, instructions = parse_prompt_file(PROMPT_FILE)
    response_format = config.get("response_format", DEFAULTS["response_format"])
    output_path = Path(args.output_file).resolve() if args.output_file else input_path.with_suffix(f".{response_format}")

    text = input_path.read_text(encoding="utf-8")
    if not text.strip():
        raise SystemExit("Input file is empty.")
    chunks = split_into_chunks(text, args.max_chars)

    final_instructions = instructions.strip()
    speed = config.get("speed", DEFAULTS["speed"]).strip()
    if speed:
        final_instructions += (
            f"\n\nZusatz: Sprich ungefähr mit Geschwindigkeitsfaktor {speed}, "
            "wobei 1.0 normales Tempo ist."
        )

    print(f"Input: {input_path}")
    print(f"Prompt: {PROMPT_FILE}")
    print(f"Model: {config.get('model', DEFAULTS['model'])}")
    print(f"Voice: {config.get('voice', DEFAULTS['voice'])}")
    print(f"Format: {response_format}")
    print(f"Chars: {len(text)}")
    print(f"Chunks: {len(chunks)}")
    print(f"Output: {output_path}")

    if args.dry_run:
        return 0

    api_key = load_api_key()

    if len(chunks) == 1:
        payload = {
            "model": config.get("model", DEFAULTS["model"]),
            "voice": config.get("voice", DEFAULTS["voice"]),
            "input": chunks[0],
            "instructions": final_instructions,
            "response_format": response_format,
        }
        request_speech(api_key, payload, output_path)
    else:
        with tempfile.TemporaryDirectory() as tmp_dir_name:
            tmp_dir = Path(tmp_dir_name)
            audio_parts: List[Path] = []

            for index, chunk in enumerate(chunks, start=1):
                chunk_output = tmp_dir / f"chunk_{index:03d}.{response_format}"
                payload = {
                    "model": config.get("model", DEFAULTS["model"]),
                    "voice": config.get("voice", DEFAULTS["voice"]),
                    "input": chunk,
                    "instructions": final_instructions,
                    "response_format": response_format,
                }
                print(f"Generating {chunk_output.name}")
                request_speech(api_key, payload, chunk_output)
                audio_parts.append(chunk_output)

            concat_audio(audio_parts, output_path)

    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
