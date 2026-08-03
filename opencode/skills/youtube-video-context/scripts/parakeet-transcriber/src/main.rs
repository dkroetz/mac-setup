use std::env;
use std::error::Error;

use parakeet_rs::sortformer::{DiarizationConfig, Sortformer};
use parakeet_rs::{ParakeetTDT, TimestampMode, Transcriber};

fn main() -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() != 5 {
        eprintln!(
            "Usage: parakeet-transcriber <wav-path> <tdt-model-dir> <sortformer-model> <offset-seconds>"
        );
        std::process::exit(1);
    }

    let wav_path = &args[1];
    let tdt_model_dir = &args[2];
    let sortformer_model = &args[3];
    let offset_seconds: f32 = args[4].parse()?;

    let (audio, sample_rate, channels) = load_wav(wav_path)?;

    let mut diarizer = Sortformer::with_config(
        sortformer_model,
        None,
        DiarizationConfig::callhome(),
    )?;
    let speaker_segments = diarizer.diarize(audio.clone(), sample_rate, channels)?;

    let mut transcriber = ParakeetTDT::from_pretrained(tdt_model_dir, None)?;
    let result = transcriber.transcribe_samples(
        audio,
        sample_rate,
        channels,
        Some(TimestampMode::Sentences),
    )?;

    for segment in &result.tokens {
        let speaker = speaker_segments
            .iter()
            .filter_map(|candidate| {
                let diar_start = candidate.start as f32 / 16_000.0;
                let diar_end = candidate.end as f32 / 16_000.0;
                let overlap_start = segment.start.max(diar_start);
                let overlap_end = segment.end.min(diar_end);
                let overlap = (overlap_end - overlap_start).max(0.0);

                if overlap > 0.0 {
                    Some((candidate.speaker_id, overlap))
                } else {
                    None
                }
            })
            .max_by(|left, right| left.1.partial_cmp(&right.1).unwrap())
            .map(|(speaker_id, _)| format!("Speaker {}", speaker_id))
            .unwrap_or_else(|| "UNKNOWN".to_string());

        let start = segment.start + offset_seconds;
        let end = segment.end + offset_seconds;
        let text = segment.text.trim();

        if !text.is_empty() {
            println!(
                "{} --> {} | {} | {}",
                format_timestamp(start),
                format_timestamp(end),
                speaker,
                text
            );
        }
    }

    Ok(())
}

fn load_wav(path: &str) -> Result<(Vec<f32>, u32, u16), Box<dyn Error>> {
    let mut reader = hound::WavReader::open(path)?;
    let spec = reader.spec();

    let audio = match spec.sample_format {
        hound::SampleFormat::Float => reader.samples::<f32>().collect::<Result<Vec<_>, _>>()?,
        hound::SampleFormat::Int => reader
            .samples::<i16>()
            .map(|sample| sample.map(|value| value as f32 / 32768.0))
            .collect::<Result<Vec<_>, _>>()?,
    };

    Ok((audio, spec.sample_rate, spec.channels))
}

fn format_timestamp(seconds: f32) -> String {
    let total_millis = (seconds.max(0.0) * 1000.0).round() as u64;
    let millis = total_millis % 1000;
    let total_seconds = total_millis / 1000;
    let secs = total_seconds % 60;
    let total_minutes = total_seconds / 60;
    let mins = total_minutes % 60;
    let hours = total_minutes / 60;

    format!("{:02}:{:02}:{:02}.{:03}", hours, mins, secs, millis)
}
