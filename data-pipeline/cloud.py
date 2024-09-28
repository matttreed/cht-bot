import os
import weaviate
import weaviate.classes as wvc
import weaviate.classes.config as wc
from util import Chunk, get_properties_dict

WEAVIATE_CLUSTER_URL = (
    os.getenv("WEAVIATE_CLUSTER_URL")
    or "https://ym7d1cb5tg2jhtwdhmq0g.c0.us-east1.gcp.weaviate.cloud"
)
WEAVIATE_ADMIN_API_KEY = (
    os.getenv("WEAVIATE_API_KEY") or "SucGsGytE3CoEASOxCSuROT6BNcIZW59S0gP"
)
WEAVIATE_READ_ONLY_API_KEY = (
    os.getenv("WEAVIATE_READ_ONLY_API_KEY") or "cBpLDDe5XeKvfKeXdO7sW2deGWatBTG6nE3B"
)
OPENAI_API_KEY = (
    os.getenv("OPENAI_API_KEY")
    or "sk-M9dLmwugbDkRHHacwtlAuKM0eknId6dx9XE3NM2MJnT3BlbkFJZH1Fbw0W9EvIrMAoE6rR0XrdpUYTiHpO9UuaXzThkA"
)
COLLECTION_NAME = "chunks"


def connect_to_weaviate():
    print("Connecting to Weaviate")
    headers = {
        "X-OpenAI-Api-Key": OPENAI_API_KEY,
    }

    client = weaviate.connect_to_wcs(
        cluster_url=WEAVIATE_CLUSTER_URL,  # `weaviate_url`: your Weaviate URL
        auth_credentials=weaviate.auth.AuthApiKey(WEAVIATE_ADMIN_API_KEY),
        headers=headers,
    )
    return client


def delete_collection(client, collection_name=COLLECTION_NAME):
    print(f"Deleting collection: {collection_name}")
    client.collections.delete(name=collection_name)


def create_collection(client, collection_name=COLLECTION_NAME):
    print(f"Creating collection: {collection_name}")

    collection = client.collections.create(
        name=collection_name,
        vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_openai(),
        generative_config=wvc.config.Configure.Generative.openai(model="gpt-3.5-turbo"),
        properties=[
            wc.Property(
                name="start_time", data_type=wc.DataType.TEXT, skip_vectorization=True
            ),
            wc.Property(
                name="end_time", data_type=wc.DataType.TEXT, skip_vectorization=True
            ),
            wc.Property(
                name="text",
                data_type=wc.DataType.TEXT,
            ),
            wc.Property(name="speaker", data_type=wc.DataType.TEXT),
            wc.Property(name="title", data_type=wc.DataType.TEXT),
            wc.Property(
                name="youtube_url", data_type=wc.DataType.TEXT, skip_vectorization=True
            ),
        ],
    )

    return collection


def populate_collection(client, chunks: list[Chunk], collection_name=COLLECTION_NAME):
    print("Populating collection")
    collection = client.collections.get(name=collection_name)

    for chunk in chunks:
        uuid = collection.data.insert(get_properties_dict(chunk))

        print(f"{chunk.title, chunk.start_time}: {uuid}", end="\n")


def upload_to_weaviate(chunks: list[Chunk]):

    try:
        client = connect_to_weaviate()

        delete_collection(client)

        create_collection(client)

        populate_collection(client, chunks)

    except Exception as e:
        print(f"Exception: {e}.")

    finally:
        print("Closing client")
        client.close()
