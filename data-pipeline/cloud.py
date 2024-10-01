import os
import weaviate
import weaviate.classes as wvc
import weaviate.classes.config as wc
from util import Chunk, get_properties_dict
import time
from tqdm import tqdm
import random

WEAVIATE_CLUSTER_URL = os.getenv("WEAVIATE_CLUSTER_URL") or ""
WEAVIATE_ADMIN_API_KEY = os.getenv("WEAVIATE_ADMIN_API_KEY") or ""
WEAVIATE_READ_ONLY_API_KEY = os.getenv("WEAVIATE_READ_ONLY_API_KEY") or ""
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
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
        # vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_cohere(
        #     api_key="your_cohere_api_key"
        # ),
        # generative_config=wvc.config.Configure.Generative.openai(model="gpt-3.5-turbo"),
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
                name="youtube_id", data_type=wc.DataType.TEXT, skip_vectorization=True
            ),
        ],
    )

    return collection


def populate_collection(client, chunks: list[Chunk], collection_name=COLLECTION_NAME):
    print("Populating collection")
    collection = client.collections.get(name=collection_name)

    max_retries = 5
    initial_delay = 0.1

    with collection.batch.dynamic() as batch:
        for chunk in tqdm(chunks):
            batch.add_object(
                properties=get_properties_dict(chunk),
            )

    return

    for chunk in tqdm(chunks):
        retries = 0
        success = False
        while not success and retries < max_retries:
            try:
                # Attempt to insert data
                uuid = collection.data.insert(get_properties_dict(chunk))
                time.sleep(initial_delay)  # Regular delay between inserts
                # print(f"{chunk.title, chunk.start_time}: {uuid}", end="\n")
                success = True  # Exit the retry loop on success
            except Exception as e:
                retries += 1
                # Exponential backoff: 2^retries seconds, plus some jitter to prevent thundering herd
                backoff_time = (initial_delay * 2**retries) + random.uniform(0, 1)
                print(
                    f"Error inserting chunk: {e}. Retrying in {backoff_time:.2f} seconds... (Attempt {retries})"
                )
                time.sleep(backoff_time)

        if not success:
            print(f"Failed to insert chunk {chunk.title} after {max_retries} retries.")


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
