---
name: youtube-video-context
description: Downloads YouTube media, produces timestamped transcripts with parakeet-rs speaker attribution, and extracts frames for visual evidence. Use when the user wants to analyze a YouTube video, cite timestamps, identify speakers, summarize spoken content, or capture screenshots from specific moments.
---

# YouTube Video Context

Use this skill to turn a YouTube video into agent-usable context: media files, timestamped transcript, speaker labels, and screenshots.

## Fast path

For a normal “analyze this YouTube video” request, do this in order:

1. Extract the YouTube video ID from the URL.
2. Run the defined download/transcribe pipeline immediately into the workspace downloads folder.
3. Read the produced `transcript.txt`.
4. Summarize with timestamps.
5. Only inspect scripts or reference docs if the pipeline fails.

## Minimal commands

```bash
# Default path for transcript + summary requests
PARAKEET_TDT_MODEL_DIR="/path/to/tdt" \
PARAKEET_SORTFORMER_MODEL="/path/to/diar_streaming_sortformer_4spk-v2.onnx" \
./scripts/transcribe-youtube.sh "<youtube-url>" ./downloads

# Download video when screenshots or visual inspection are needed
./scripts/download-youtube.sh "<youtube-url>" ./downloads video

# Extract one exact frame
./scripts/extract-frame.sh "<youtube-url-or-local-video>" 00:12:34.500 ./frame.png
```

## Rules

- Do not glob, search, or inspect the local machine for prior transcripts or prior video artifacts. Always run the pipeline for normal YouTube analysis requests.
- Ignore sampled `skill_files` and anything under the skill's own directory unless you are editing the skill itself.
- For summary requests, use the pipeline-produced `transcript.txt`; do not inspect `description` or `info.json` unless extra metadata matters.
- For summary requests, call `transcribe-youtube.sh` directly. Do not call `download-youtube.sh` first for audio; the transcription script already downloads audio.
- When running skill scripts from outside the workspace, pass an absolute workspace output path such as `/abs/path/to/project/downloads`; do not rely on `./downloads` from the skill directory.
- Prefer **audio download** for transcription-only requests.
- Prefer **full video download** when the user needs screenshots or UI details.
- Tell the user that speaker diarization is best-effort and Sortformer is limited to about 4 speakers.
- For long videos, keep chunking enabled; parakeet TDT works best on shorter chunks.
- Do not use YouTube captions/subtitles as the default source. Use the defined `yt-dlp` + `parakeet-rs` pipeline unless the user explicitly asks for captions.
- Preserve timestamp evidence in the final answer whenever you quote or summarize the video.
- If the user asks for a screenshot at a time, use `yt-dlp` to fetch the source and `ffmpeg` to extract the frame; do not claim `yt-dlp` alone creates exact screenshots.
- Do not read this skill's reference files unless you need a specific command or caveat not already in this file.
- Do not read the script source in the normal path. Execute the pipeline first; inspect source only after a failure.
- Do not check for a `parakeet-rs` executable. This skill's transcription path uses `cargo run` plus local model files.
- Do not preflight environment variables manually in the normal path. Let the script fail clearly if configuration is missing.
- If the transcription script fails once because of environment/model mismatch, stop and report the blocker clearly. Do **not** start debugging third-party library internals unless the user asked you to fix the pipeline.
- Do not build the Rust helper manually unless you are actively editing the helper.

## Default workflows

### Summary or analysis

1. Run `transcribe-youtube.sh` once with an absolute workspace downloads path.
2. Read the produced `transcript.txt`.
3. Summarize with timestamps.
4. Do not read the transcription script unless you are debugging the pipeline itself.

### Screenshot request

1. Run `download-youtube.sh ... video` with an absolute workspace downloads path, or use the direct-stream frame path.
2. Save screenshots inside `downloads/<video-folder>/screenshots/`, not at the top level of `downloads/`.
3. Extract the requested frame.
4. If spoken context also matters, run `transcribe-youtube.sh` separately and combine transcript evidence with screenshots.

### Full evidence bundle

1. Run the transcript pipeline.
2. Download video if screenshots are needed.
3. Save screenshots inside `downloads/<video-folder>/screenshots/`.
4. Deliver summary + timestamp quotes + screenshot paths.

## Expected outputs

- `media.*` or `audio.*`
- `*.description`
- `*.info.json`
- `transcript.txt`
- optional `screenshots/frame-*.png`

## Notes on screenshots

- Fast path: `ffmpeg -ss <time> -i "$(yt-dlp --get-url ...)" -frames:v 1 frame.png`
- More repeatable path: download the video first, then extract from the local file.
- Preferred output location: `downloads/<video-folder>/screenshots/`.
- YouTube metadata often includes storyboard thumbnail formats in `.info.json`; use those for rough navigation, then extract an exact frame from the real video.

## Stop conditions

- If the pipeline succeeds and `transcript.txt` was read, stop.
- If one script fails because of missing dependencies or model layout mismatch, report the exact failure and stop.
- Avoid repeated directory listing, any local transcript discovery, repeated metadata inspection, or source-code spelunking unless the user explicitly wants pipeline debugging.

See [REFERENCE.md](REFERENCE.md) for dependency setup, caveats, and command details.
