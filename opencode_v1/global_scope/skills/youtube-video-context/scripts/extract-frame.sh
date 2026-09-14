#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: extract-frame.sh <youtube-url-or-local-video> <HH:MM:SS.mmm> <output-image>

Examples:
  extract-frame.sh "https://www.youtube.com/watch?v=abc" 00:12:34.500 ./frame.png
  extract-frame.sh ./downloads/video.mp4 00:12:34.500 ./frame.png
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

command -v ffmpeg >/dev/null 2>&1 || die "ffmpeg not found in PATH"

INPUT="$1"
TIMESTAMP="$2"
OUTPUT_IMAGE="$3"

mkdir -p "$(dirname "$OUTPUT_IMAGE")"

if [[ "$INPUT" =~ ^https?:// ]]; then
  command -v yt-dlp >/dev/null 2>&1 || die "yt-dlp not found in PATH"
  STREAM_URL="$(yt-dlp --no-playlist --get-url "$INPUT")"
  ffmpeg -y -ss "$TIMESTAMP" -i "$STREAM_URL" -frames:v 1 -q:v 2 "$OUTPUT_IMAGE"
else
  [ -f "$INPUT" ] || die "local video not found: $INPUT"
  ffmpeg -y -ss "$TIMESTAMP" -i "$INPUT" -frames:v 1 -q:v 2 "$OUTPUT_IMAGE"
fi
