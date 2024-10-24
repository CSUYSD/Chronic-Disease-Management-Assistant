import chromadb
from chromadb.config import Settings

# 连接到 ChromaDB
client = chromadb.HttpClient(host="localhost", port=8000, settings=Settings(
                chroma_client_auth_provider="chromadb.auth.token_authn.TokenAuthClientProvider",
                chroma_client_auth_credentials="admin:admin"
            ))

# 定义要检查的 collection 名称
collection_name = "health-ai"

try:
    # 尝试获取 collection
    collection = client.get_collection(name=collection_name)
    print(f"成功连接到 ChromaDB 并找到 collection: {collection_name}")
    
    # 获取 collection 的一些基本信息
    count = collection.count()
    print(f"Collection '{collection_name}' 中的项目数量: {count}")

except Exception as e:
    if "Collection not found" in str(e):
        print(f"Collection '{collection_name}' 不存在。")
    else:
        print(f"连接或查询 ChromaDB 时发生错误: {e}")

# 列出所有可用的 collections
all_collections = client.list_collections()
print("所有可用的 collections:")
for coll in all_collections:
    print(f" - {coll.name}")