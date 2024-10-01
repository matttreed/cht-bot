from util import Source, Chunk, AUDIO_FOLDER, TRANSCRIPTIONS_FOLDER

# from pytube import YouTube
import yt_dlp
import os
import whisper
import json


def download_audio(sources: list[Source]):
    print("Downloading audio files")
    for source in sources:
        # download video audio into folder audio_files
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": f"{AUDIO_FOLDER}/{source.slug}.%(ext)s",
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": "aac",
                    "preferredquality": "192",
                }
            ],
            "ffmpeg_location": "/usr/local/bin/ffmpeg",
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            youtube_url = "https://www.youtube.com/watch?v=" + source.youtube_id
            ydl.download([youtube_url])


def transcribe_audio(sources: list[Source]):
    # Load the Whisper model (you can choose from different model sizes like 'base', 'small', 'medium', 'large')
    model = whisper.load_model("base")

    for source in sources:
        # Transcribe the audio file with timestamps
        filepath = f"{AUDIO_FOLDER}/{source.slug}.m4a"
        result = model.transcribe(filepath, language="en", word_timestamps=True)

        transcription = []
        # Display the transcription
        for segment in result["segments"]:
            transcription.append(
                {
                    "text": segment["text"],
                    "start_time": segment["start"],
                    "end_time": segment["end"],
                }
            )

        with open(f"{TRANSCRIPTIONS_FOLDER}/{source.slug}.json", "w") as f:
            json.dump(transcription, f, indent=4)


def get_chunks(sources: list[Source]) -> list[Chunk]:
    chunks: list[Chunk] = []
    for source in sources:
        with open(f"{TRANSCRIPTIONS_FOLDER}/{source.slug}.json") as f:
            transcription = json.load(f)

            for i in range(len(transcription)):
                segment = transcription[i]
                text = "".join(
                    [
                        transcription[j]["text"]
                        for j in range(i, len(transcription))
                        if transcription[j]["start_time"] < 30 + segment["start_time"]
                    ]
                )

                chunks.append(
                    Chunk(
                        segment["start_time"],
                        segment["end_time"],
                        text,
                        "speaker",
                        source.title,
                        source.youtube_id,
                    )
                )

    return chunks
