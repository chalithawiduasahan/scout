import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from strands import Agent
from strands.models import BedrockModel
from strands_tools.tavily import tavily_search
from tools.crm import create_lead_record
from tools.outreach import send_followup_email

model = BedrockModel(
    model_id="us.anthropic.claude-haiku-4-5-20251001-v1:0",
    region_name="us-east-1"
)

# ---- Stage 1: Discovery — find real candidate businesses ----
DISCOVERY_SYSTEM_PROMPT = """You are a lead discovery assistant for an automation freelancer.
Given a business niche and a location, use the tavily_search tool to find 3 REAL,
currently operating businesses that match. Only include businesses you can verify are real
based on actual search results — never invent a business.

Respond with ONLY a numbered list, one business name per line, in this exact format:
1. Business Name
2. Business Name
3. Business Name

No extra commentary before or after the list.
"""

discovery_agent = Agent(model=model, tools=[tavily_search], system_prompt=DISCOVERY_SYSTEM_PROMPT, callback_handler=None)

async def find_businesses(niche: str, location: str) -> list[str]:
    query = f"Find businesses in the '{niche}' niche located in {location}."
    response = await discovery_agent.invoke_async(query)
    text = str(response)
    names = []
    for line in text.strip().split("\n"):
        line = line.strip()
        if line and line[0].isdigit():
            name = line.split(".", 1)[-1].strip()
            if name:
                names.append(name)
    return names

# ---- Stage 2: Deep research ----
RESEARCH_SYSTEM_PROMPT = """You are a business research assistant for an automation freelancer.
Given a business name and location, use the tavily_search tool to find their website
and social media presence. Then summarize in this format:

Business type:
Estimated scale (small/medium):
One manual, repetitive task this business likely does that could be automated:

Be specific and concrete. Base your answer only on what you actually find via search —
if you can't find enough information, say so honestly instead of guessing.
"""

research_agent = Agent(model=model, tools=[tavily_search], system_prompt=RESEARCH_SYSTEM_PROMPT, callback_handler=None)

async def research_business(business_name: str) -> str:
    response = await research_agent.invoke_async(f"Research this business: {business_name}")
    return str(response)

# ---- Stage 3: Build the demo automation, using the real research findings ----
AUTOMATION_SYSTEM_PROMPT = """You are an automation builder for a freelancer's demo.
You will be given a business's name and research about them, including a likely pain point.

Do the following:
1. Invent one realistic, plausible customer inquiry this business might receive — something
   a real customer would actually write, connected to the pain point you were given.
2. Save that inquiry as a new lead using create_lead_record, using the invented customer's
   name and the fixed demo email address you were given (use it exactly as provided).
3. Send a short, warm, personalized follow-up email replying to that inquiry using
   send_followup_email, written in the voice of the business being pitched to.

Keep the email under 100 words, friendly and professional. Reference the actual inquiry.
"""

automation_agent = Agent(
    model=model,
    tools=[create_lead_record, send_followup_email],
    system_prompt=AUTOMATION_SYSTEM_PROMPT,
    callback_handler=None
)

async def build_demo_automation(business_name: str, research_profile: str, demo_email: str) -> str:
    prompt = (
        f"Business: {business_name}\n\n"
        f"Research findings:\n{research_profile}\n\n"
        f"Use this exact email address for the demo customer: {demo_email}"
    )
    response = await automation_agent.invoke_async(prompt)
    return str(response)

# ---- Run the full chain ----
async def main():
    niche = "event planners"          # this becomes a UI input field later
    location = "Colombo, Sri Lanka"   # same here
    demo_email = os.getenv("SES_TEST_RECIPIENT")

    print(f"Finding businesses for niche='{niche}', location='{location}'...\n")
    businesses = await find_businesses(niche, location)
    print(f"Found {len(businesses)} businesses: {businesses}\n")

    for name in businesses:
        print(f"\n=== Researching: {name} ===")
        profile = await research_business(name)
        print(profile)

        print(f"\n=== Building demo automation for: {name} ===")
        automation_result = await build_demo_automation(name, profile, demo_email)
        print(automation_result)

if __name__ == "__main__":
    asyncio.run(main())