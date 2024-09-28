from util import Source, Chunk, get_sources
from process_audio import download_audio, transcribe_audio, get_chunks
from cloud import upload_to_weaviate
import json


def main():
    sources: list[Source] = get_sources()

    download_audio([source for source in sources if not source.downloaded])
    transcribe_audio([source for source in sources if not source.transcribed])

    chunks: list[Chunk] = get_chunks(sources)

    upload_to_weaviate(chunks)


if __name__ == "__main__":
    main()
