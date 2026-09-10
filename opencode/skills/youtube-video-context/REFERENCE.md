---
title: YouTube Video Context Reference
---

# Reference

## Anti-loop playbook

For a plain analysis request, prefer this sequence:

1. Extract the video ID.
2. Run the defined audio transcription pipeline immediately.
3. Read the produced `transcript.txt`.
4. Only touch `.description` or `.info.json` if you need title, duration, chapters, or storyboard hints.
5. If transcription fails once because of environment or model layout, stop and report the blocker instead of debugging library internals.

Good behavior:

- one pipeline run
- one read of transcript
- one summarization pass

Usually unnecessary for a simple summary request:

- reading this reference file again
- listing the skill scripts
- listing the download directory after `yt-dlp` already returned a path
- globbing or searching for prior transcripts
- reading both description and info unless metadata is needed
- checking for a `parakeet-rs` executable
- checking environment variables before the pipeline is attempted
- downloading YouTube captions/subtitles as a substitute for the pipeline
- building the Rust helper manually
- inspecting cargo registry sources

## Dependencies

Required tools:

- `yt-dlp`
- `ffmpeg`
- `ffprobe`
- `cargo`

Required model assets:

- `PARAKEET_TDT_MODEL_DIR` → directory for a punctuation-aware Parakeet TDT model
- `PARAKEET_SORTFORMER_MODEL` → path to `diar_streaming_sortformer_4spk-v2.onnx` or v2.1

The bundled Rust helper uses the documented `parakeet-rs` pattern of:

- TDT transcription with sentence timestamps
- Sortformer diarization
- overlap matching to assign a speaker label to each sentence

## Workflow details

### 1. Download media

Use this only when you explicitly need a saved video/audio artifact outside the normal transcript flow.

Transcript only:

```bash
./scripts/download-youtube.sh "<youtube-url>" ./downloads audio
```

Transcript plus screenshots:

```bash
./scripts/download-youtube.sh "<youtube-url>" ./downloads video
```

This creates a directory like:

```text
downloads/<title> [<video-id>]/
  audio.webm or media.mp4
  *.description
  *.info.json
  screenshots/
```

### 2. Produce a transcript

```bash
PARAKEET_TDT_MODEL_DIR="/path/to/tdt" \
PARAKEET_SORTFORMER_MODEL="/path/to/diar_streaming_sortformer_4spk-v2.onnx" \
./scripts/transcribe-youtube.sh "<youtube-url>" ./downloads
```

This is the default path for summary/analysis requests. Do not call `download-youtube.sh` first for audio; `transcribe-youtube.sh` already downloads the audio it needs.

The wrapper script:

1. downloads audio with `yt-dlp`
2. converts it to 16 kHz mono WAV
3. splits the WAV into 240-second chunks
4. runs the bundled Rust helper on each chunk
5. appends the output into `transcript.txt`

Normal path rule: do not search for a preexisting transcript first. Run this pipeline directly for YouTube analysis requests.

Output lines look like:

```text
00:03:10.421 --> 00:03:15.908 | Speaker 1 | Here the presenter explains the plugin setup.
```

If diarization cannot confidently map a segment, the label becomes `UNKNOWN`.

If the wrapper fails because the local model directory shape does not match what `parakeet-rs` expects, report that as an environment blocker. Do not investigate crate internals unless the user asks for pipeline repair.

## Screenshot extraction

### Exact frame from downloaded video

```bash
mkdir -p ./downloads/<title>/screenshots
./scripts/extract-frame.sh ./downloads/<title>/media.mp4 00:12:34.500 ./downloads/<title>/screenshots/frame-00-12-34.500.png
```

### Exact frame without saving a full video first

```bash
mkdir -p ./downloads/<title>/screenshots
./scripts/extract-frame.sh "https://www.youtube.com/watch?v=..." 00:12:34.500 ./downloads/<title>/screenshots/frame-00-12-34.500.png
```

Internally that uses:

```bash
ffmpeg -ss 00:12:34.500 -i "$(yt-dlp --get-url "<youtube-url>")" -frames:v 1 -q:v 2 frame.png
```

Preferred screenshot location:

```text
downloads/<title> [<video-id>]/screenshots/
```

## Storyboards vs exact screenshots

`yt-dlp --write-info-json` often captures YouTube storyboard formats in `.info.json` (`sb0`, `sb1`, `sb2`, `sb3`). Those are useful for:

- finding visually interesting moments quickly
- approximating timestamp locations
- browsing a low-cost visual index

But they are **not** exact full-resolution screenshots. For precise evidence, always extract from the real video stream with `ffmpeg`.

## Caveats

- Speaker attribution is best-effort and may drift when speakers overlap.
- Sortformer is typically limited to about 4 speakers.
- Long-form transcription is chunked because TDT works better on shorter inputs.
- Bad source audio lowers both transcription and diarization quality.
- Some videos may be unavailable, geo-restricted, private, or otherwise blocked.

## Deliverable pattern

When reporting results, include:

1. short summary
2. timestamped evidence quotes
3. speaker label when available
4. screenshot paths for visually relevant claims
