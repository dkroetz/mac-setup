#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: transcribe-youtube.sh <youtube-url> <output-root>

Environment:
  PARAKEET_TDT_MODEL_DIR      Directory containing Parakeet TDT model files
  PARAKEET_SORTFORMER_MODEL   Path to diar_streaming_sortformer_4spk-v2.onnx (or v2.1)
  CHUNK_SECONDS               Optional; default 240

Example:
  PARAKEET_TDT_MODEL_DIR="/models/tdt" \
  PARAKEET_SORTFORMER_MODEL="/models/diar_streaming_sortformer_4spk-v2.onnx" \
  transcribe-youtube.sh "https://www.youtube.com/watch?v=abc" ./downloads

Behavior:
  Emits progress logs for download, conversion, chunking, and transcription.
EOF
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*" >&2
}

cleanup() {
  if [ -n "${TEMP_MODEL_DIR:-}" ] && [ -d "$TEMP_MODEL_DIR" ]; then
    rm -rf "$TEMP_MODEL_DIR"
  fi
}

link_first_existing() {
  local target="$1"
  shift
  local candidate
  for candidate in "$@"; do
    if [ -f "$candidate" ]; then
      ln -sf "$candidate" "$target"
      return 0
    fi
  done
  return 1
}

prepare_tdt_model_dir() {
  local source_dir="$1"
  local compat_dir

  if [ -f "$source_dir/encoder-model.onnx" ] && [ -f "$source_dir/decoder_joint-model.onnx" ] && [ -f "$source_dir/vocab.txt" ]; then
    printf '%s\n' "$source_dir"
    return 0
  fi

  compat_dir="$(mktemp -d "${TMPDIR:-/tmp}/parakeet-tdt-compat.XXXXXX")"
  TEMP_MODEL_DIR="$compat_dir"

  [ -f "$source_dir/vocab.txt" ] || die "vocab.txt not found in $source_dir"
  ln -sf "$source_dir/vocab.txt" "$compat_dir/vocab.txt"

  if [ -f "$source_dir/config.json" ]; then
    ln -sf "$source_dir/config.json" "$compat_dir/config.json"
  fi

  if [ -f "$source_dir/.variant" ]; then
    ln -sf "$source_dir/.variant" "$compat_dir/.variant"
  fi

  link_first_existing "$compat_dir/encoder-model.onnx" \
    "$source_dir/encoder-model.onnx" \
    "$source_dir/encoder-model.fp16.onnx" \
    "$source_dir/encoder.onnx" \
    "$source_dir/encoder.int8.onnx" \
    "$source_dir/encoder-model.int8.onnx" \
    || die "Could not find a compatible encoder model in $source_dir"

  link_first_existing "$compat_dir/decoder_joint-model.onnx" \
    "$source_dir/decoder_joint-model.onnx" \
    "$source_dir/decoder_joint-model.fp16.onnx" \
    "$source_dir/decoder_joint.onnx" \
    "$source_dir/decoder_joint.int8.onnx" \
    "$source_dir/decoder_joint-model.int8.onnx" \
    || die "Could not find a compatible decoder_joint model in $source_dir"

  printf '%s\n' "$compat_dir"
}

trap cleanup EXIT

[ $# -eq 2 ] || {
  usage
  exit 1
}

command -v yt-dlp >/dev/null 2>&1 || die "yt-dlp not found in PATH"
command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg not found in PATH"
command -v ffprobe >/dev/null 2>&1 || die "ffprobe not found in PATH"
command -v cargo >/dev/null 2>&1 || die "cargo not found in PATH"

URL="$1"
OUTPUT_ROOT="$2"
CHUNK_SECONDS="${CHUNK_SECONDS:-240}"
TDT_DIR="${PARAKEET_TDT_MODEL_DIR:-}"
SORTFORMER_MODEL="${PARAKEET_SORTFORMER_MODEL:-}"
TEMP_MODEL_DIR=""

[ -n "$TDT_DIR" ] || die "PARAKEET_TDT_MODEL_DIR is required"
[ -d "$TDT_DIR" ] || die "TDT model directory not found: $TDT_DIR"
[ -n "$SORTFORMER_MODEL" ] || die "PARAKEET_SORTFORMER_MODEL is required"
[ -f "$SORTFORMER_MODEL" ] || die "Sortformer model not found: $SORTFORMER_MODEL"

TDT_RUN_DIR="$(prepare_tdt_model_dir "$TDT_DIR")"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER_MANIFEST="$SCRIPT_DIR/parakeet-transcriber/Cargo.toml"

mkdir -p "$OUTPUT_ROOT"

log "Preparing transcript run"
log "Output root: $OUTPUT_ROOT"
if [ "$TDT_RUN_DIR" != "$TDT_DIR" ]; then
  log "Using compatibility model directory for parakeet-rs"
fi

log "Downloading audio with yt-dlp"
MEDIA_PATH="$(yt-dlp \
  --no-playlist \
  --quiet \
  --no-warnings \
  --write-description \
  --write-info-json \
  --print after_move:filepath \
  --output "$OUTPUT_ROOT/%(title)s [%(id)s]/audio.%(ext)s" \
  --format 'ba[acodec^=opus]/ba' \
  "$URL")"

[ -n "$MEDIA_PATH" ] || die "yt-dlp did not return a media path"
[ -f "$MEDIA_PATH" ] || die "downloaded media not found: $MEDIA_PATH"

log "Downloaded media: $MEDIA_PATH"

VIDEO_DIR="$(dirname "$MEDIA_PATH")"
WAV_PATH="$VIDEO_DIR/audio-16k-mono.wav"
TRANSCRIPT_PATH="$VIDEO_DIR/transcript.txt"

log "Converting media to 16 kHz mono WAV"
ffmpeg -y -i "$MEDIA_PATH" -ar 16000 -ac 1 "$WAV_PATH" >/dev/null 2>&1

DURATION_RAW="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$WAV_PATH")"
DURATION_SECONDS="${DURATION_RAW%.*}"

if [ -z "$DURATION_SECONDS" ] || [ "$DURATION_SECONDS" -le 0 ]; then
  die "could not determine audio duration"
fi

TOTAL_CHUNKS=$(((DURATION_SECONDS + CHUNK_SECONDS - 1) / CHUNK_SECONDS))
log "Audio duration: ${DURATION_RAW}s"
log "Chunk size: ${CHUNK_SECONDS}s (${TOTAL_CHUNKS} chunk(s))"

: > "$TRANSCRIPT_PATH"

OFFSET=0
INDEX=0
while [ "$OFFSET" -lt "$DURATION_SECONDS" ]; do
  CHUNK_NUMBER=$((INDEX + 1))
  CHUNK_END=$((OFFSET + CHUNK_SECONDS))
  if [ "$CHUNK_END" -gt "$DURATION_SECONDS" ]; then
    CHUNK_END="$DURATION_SECONDS"
  fi
  CHUNK_PATH="$VIDEO_DIR/chunk_$(printf '%03d' "$INDEX").wav"
  log "[$CHUNK_NUMBER/$TOTAL_CHUNKS] Preparing chunk ${OFFSET}s-${CHUNK_END}s"
  ffmpeg -y -ss "$OFFSET" -t "$CHUNK_SECONDS" -i "$WAV_PATH" -ar 16000 -ac 1 "$CHUNK_PATH" >/dev/null 2>&1

  log "[$CHUNK_NUMBER/$TOTAL_CHUNKS] Transcribing chunk"
  cargo run --quiet --manifest-path "$RUNNER_MANIFEST" -- \
    "$CHUNK_PATH" \
    "$TDT_RUN_DIR" \
    "$SORTFORMER_MODEL" \
    "$OFFSET" >> "$TRANSCRIPT_PATH"

  rm -f "$CHUNK_PATH"
  log "[$CHUNK_NUMBER/$TOTAL_CHUNKS] Done"
  OFFSET=$((OFFSET + CHUNK_SECONDS))
  INDEX=$((INDEX + 1))
done

log "Transcript ready: $TRANSCRIPT_PATH"
printf 'Transcript written to %s\n' "$TRANSCRIPT_PATH"
