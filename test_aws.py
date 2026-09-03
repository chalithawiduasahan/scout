import boto3
from dotenv import load_dotenv

load_dotenv()

client = boto3.client('bedrock-runtime', region_name='us-east-1')

try:
    print("Testing direct connection...", flush=True)
    response = client.converse(
        modelId="us.anthropic.claude-sonnet-4-20250514-v1:0",
        messages=[{"role": "user", "content": [{"text": "Hello!"}]}]
    )
    print("Success!")
    print(response['output']['message']['content'][0]['text'])
except Exception as e:
    print("Error encountered:", e)