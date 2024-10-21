import chromadb
from chromadb.config import Settings
import time
import sys

max_retries = 5
retry_delay = 5

for attempt in range(max_retries):
    try:
        client = chromadb.HttpClient(
            host="chroma",
            port=8000,
            settings=Settings(
                chroma_client_auth_provider="chromadb.auth.token_authn.TokenAuthClientProvider",
                chroma_client_auth_credentials="admin:admin"
            )
        )
        collection = client.get_or_create_collection("health-ai")
        print(client.list_collections())
        print("Successfully connected to Chroma and created/accessed collection.")
        break
    except Exception as e:
        print(f"Attempt {attempt + 1} failed. Error: {str(e)}")
        if attempt < max_retries - 1:
            print(f"Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
        else:
            print("Failed to connect to Chroma after multiple attempts.")
            sys.exit(1)