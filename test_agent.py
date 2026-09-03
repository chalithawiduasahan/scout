import asyncio
from dotenv import load_dotenv
load_dotenv()

from strands import Agent
from strands.models import BedrockModel

# Using active supported model ID from your account list
model = BedrockModel(
    model_id="us.anthropic.claude-haiku-4-5-20251001-v1:0",
    region_name="us-east-1"
)

agent = Agent(model=model)

async def main():
    print("Calling Bedrock...", flush=True)
    response = await agent.invoke_async("Say 'System Ready!' if you can hear me.")
    print("\n--- AGENT OUTPUT ---")
    print(response)

if __name__ == "__main__":
    asyncio.run(main())