import os
from pinecone import Pinecone, ServerlessSpec

# 从环境变量获取 Pinecone API 密钥和环境名称
api_key = os.getenv('PINECONE_API_KEY')
environment = os.getenv('PINECONE_ENVIRONMENT')

# 如果没有从环境变量获取到 API 密钥和环境名称，请手动输入
if not api_key:
    api_key = 'ce1b409d-ae03-4917-b12d-911bb92f441e'
if not environment:
    environment = 'us-east-1'

try:
    # 初始化 Pinecone
    pc = Pinecone(api_key=api_key)

    # 连接到现有索引
    index_name = 'health-care'  # 替换为您的索引名称
    index = pc.Index(index_name)
    print(f"Connected to index '{index_name}'.")

    # 插入一些测试数据
    vectors = [
        ("vec1", [0.1] * 1536, {"metadata": "test1"}),
        ("vec2", [0.2] * 1536, {"metadata": "test2"})
    ]

    index.upsert(vectors=vectors)
    print("Inserted test vectors.")

    # 查询数据
    query_result = index.query(vector=[0.1] * 1536, top_k=2, include_metadata=True)
    print("Query result:", query_result)

except Exception as e:
    print(f"An error occurred: {e}")