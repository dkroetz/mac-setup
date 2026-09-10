#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: download-youtube.sh <youtube-url> <output-root> <audio|video>

Examples:
  download-youtube.sh "https://www.youtube.com/watch?v=abc" ./downloads audio
  download-youtube.sh "https://www.youtube.com/watch?v=abc" ./downloads video
EOF
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

[ $# -eq 3 ] || {
  usage
  exit 1
}

command -v yt-dlp >/dev/null 2>&1 || die "yt-dlp not found in PATH"

URL="$1"
OUTPUT_ROOT="$2"
MODE="$3"

mkdir -p "$OUTPUT_ROOT"

case "$MODE" in
  audio)
    yt-dlp \
      --no-playlist \
      --write-description \
      --write-info-json \
      --print after_move:filepath \
      --output "$OUTPUT_ROOT/%(title)s [%(id)s]/audio.%(ext)s" \
      --format 'ba[acodec^=opus]/ba' \
      "$URL"
    ;;
  video)
    yt-dlp \
      --no-playlist \
      --write-description \
      --write-info-json \
      --print after_move:filepath \
      --output "$OUTPUT_ROOT/%(title)s [%(id)s]/media.%(ext)s" \
      --format 'bv*+ba/b' \
      --merge-output-format mp4 \
      "$URL"
    ;;
  *)
    die "mode must be 'audio' or 'video'"
    ;;
esac
