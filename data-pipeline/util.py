import json
from dataclasses import dataclass
import os
import csv

TRANSCRIPTIONS_FOLDER = "transcriptions"
AUDIO_FOLDER = "audio_files"


@dataclass
class Source:
    title: str
    slug: str
    youtube_id: str
    downloaded: bool = False
    transcribed: bool = False


@dataclass
class Chunk:
    start_time: int
    end_time: int
    text: str
    speaker: str
    title: str
    youtube_id: str


def get_properties_dict(chunk: Chunk):
    return {
        "start_time": str(chunk.start_time),
        "end_time": str(chunk.end_time),
        "text": chunk.text,
        "speaker": chunk.speaker,
        "title": chunk.title,
        "youtube_id": chunk.youtube_id,
    }


def get_existing_audio_files() -> set:
    if not os.path.exists(AUDIO_FOLDER):
        os.makedirs(AUDIO_FOLDER)

    return {
        os.path.splitext(f)[0] for f in os.listdir(AUDIO_FOLDER) if f.endswith(".m4a")
    }


def get_transcribed_audio_files() -> set:
    if not os.path.exists(TRANSCRIPTIONS_FOLDER):
        os.makedirs(TRANSCRIPTIONS_FOLDER)

    return {
        os.path.splitext(f)[0]
        for f in os.listdir(TRANSCRIPTIONS_FOLDER)
        if f.endswith(".json")
    }


def get_sources() -> list[Source]:

    f = open("sources.csv")
    reader = csv.reader(f)
    next(reader)  # Skip header
    sources: list[Source] = []
    for row in reader:
        title, slug, youtube_id = row[0], row[1], row[2]
        sources.append(Source(title, slug, youtube_id))
    f.close()

    downloaded_audio_files = get_existing_audio_files()

    transcribed_audio_files = get_transcribed_audio_files()

    for source in sources:
        source.downloaded = source.slug in downloaded_audio_files
        source.transcribed = source.slug in transcribed_audio_files

    return sources


# def save_sources(sources: list[Source]):
#     with open("sources.csv", mode="w", newline="") as f:
#         writer = csv.writer(f)

#         writer.writerow(["title", "slug", "youtube_url", "downloaded", "transcribed"])

#         for source in sources:
#             writer.writerow(
#                 [
#                     source.title,
#                     source.slug,
#                     source.youtube_url,
#                     str(source.downloaded),
#                     str(source.transcribed),
#                 ]
#             )
