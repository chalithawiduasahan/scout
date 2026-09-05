import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from strands import Agent
from strands.models import BedrockModel
from strands_tools.tavily import tavily_search
from playwright.sync_api import sync_playwright
from tools.crm import save_lead_now, archive_lead_now
from tools.outreach import send_email_with_attachments

model = BedrockModel(
    model_id="us.anthropic.claude-haiku-4-5-20251001-v1:0",
    region_name="us-east-1"
)

TALLY_FORM_URL = os.getenv("TALLY_FORM_URL")
AIRTABLE_SHARE_URL = os.getenv("AIRTABLE_SHARE_URL")

# ---- Stage 1: Discovery with Scale Criteria ----
DISCOVERY_SYSTEM_PROMPT = """You are a lead discovery assistant for an automation freelancer.
Given a business niche, location, and targeted business scale:
- Small: Single-location independent businesses, boutique shops, or small local operations (<10 staff).
- Medium: Regional multi-location businesses or medium-sized teams (10-50 staff).
- Large: National chains, major franchises, or enterprise corporations (50+ staff).

Use the tavily_search tool to find REAL, currently operating businesses matching the requested niche and location.
Strictly filter candidates based on the scale category requested. If "small" is requested, EXCLUDE large chains or well-known national franchises.

Respond with ONLY a numbered list, one business name per line, in this exact format:
1. Business Name
2. Business Name
3. Business Name

No extra commentary before or after the list.
"""

discovery_agent = Agent(model=model, tools=[tavily_search], system_prompt=DISCOVERY_SYSTEM_PROMPT, callback_handler=None)

async def find_businesses(niche: str, location: str, scale: str = "small") -> list[str]:
    query = f"Find {scale}-scale businesses in the '{niche}' niche located in {location}."
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

# ---- Stage 3: Build the REAL demo ----
DEMO_LEAD_SYSTEM_PROMPT = """Given a business's name and research about them, invent ONE realistic,
plausible customer inquiry this business might receive, along with a matching realistic customer name and fake email address.

Respond with ONLY this exact format, nothing else:
NAME: <a realistic customer name, e.g., Sarah Mitchell>
EMAIL: <a realistic fake email, e.g., sarah.mitchell@outlook.com>
INQUIRY: <the inquiry text, 1-3 sentences regarding pricing or booking>
"""

demo_lead_agent = Agent(model=model, tools=[], system_prompt=DEMO_LEAD_SYSTEM_PROMPT, callback_handler=None)

async def invent_demo_lead(business_name: str, research_profile: str) -> tuple[str, str, str]:
    prompt = f"Business: {business_name}\n\nResearch findings:\n{research_profile}"
    response = await demo_lead_agent.invoke_async(prompt)
    name, email, inquiry = "Sarah Mitchell", "sarah.mitchell@outlook.com", f"Hi, I would like to inquire about your availability and package options for an upcoming booking with {business_name}."
    
    for line in str(response).strip().split("\n"):
        line = line.strip()
        if line.startswith("NAME:"):
            parsed_name = line.replace("NAME:", "").strip()
            if parsed_name: name = parsed_name
        elif line.startswith("EMAIL:"):
            parsed_email = line.replace("EMAIL:", "").strip()
            if parsed_email: email = parsed_email
        elif line.startswith("INQUIRY:"):
            parsed_inquiry = line.replace("INQUIRY:", "").strip()
            if parsed_inquiry: inquiry = parsed_inquiry
            
    return name, email, inquiry

DEMO_REPLY_SYSTEM_PROMPT = """You are drafting an automated reply email as if you ARE the business
being pitched to, replying to a customer's inquiry just submitted through your contact form.

Given the business's name, research about them, the customer's name, and their inquiry,
write a short, warm, professional reply in the voice of that business, referencing the
customer's specific inquiry. Keep it under 100 words.

IMPORTANT: Do NOT use markdown formatting like asterisks (**bold** or *italic*). Output pure plain text only.

Respond in this format:
SUBJECT: <subject line>
BODY: <email body>
"""

demo_reply_agent = Agent(model=model, tools=[], system_prompt=DEMO_REPLY_SYSTEM_PROMPT, callback_handler=None)

async def draft_demo_reply(business_name: str, research_profile: str, customer_name: str, inquiry: str) -> tuple[str, str]:
    prompt = (
        f"Business: {business_name}\n\nResearch findings:\n{research_profile}\n\n"
        f"Customer name: {customer_name}\nCustomer inquiry: {inquiry}"
    )
    response = await demo_reply_agent.invoke_async(prompt)
    res_str = str(response).strip()
    
    subject = f"Thank you for reaching out to {business_name}!"
    body = f"Hi {customer_name},\n\nThank you for reaching out to {business_name}.\n\nWe received your inquiry regarding:\n\"{inquiry}\"\n\nOur team is reviewing your details and will follow up with you shortly.\n\nBest regards,\n{business_name} Customer Support"

    if "SUBJECT:" in res_str and "BODY:" in res_str:
        try:
            parts = res_str.split("BODY:", 1)
            subject_part = parts[0].replace("SUBJECT:", "").strip()
            body_part = parts[1].strip()
            if subject_part: subject = subject_part
            if body_part: body = body_part
        except Exception:
            pass

    return subject, body

# ---- Synchronous Playwright Helpers (Thread-safe & Strict Input Selectors) ----
def submit_demo_form_sync(name: str, email: str, inquiry: str, screenshot_path: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(TALLY_FORM_URL)
        page.wait_for_selector('input', timeout=5000)

        page.get_by_label("Name").fill(name)
        page.get_by_label("Email").fill(email)
        page.get_by_label("Inquiry").fill(inquiry)

        page.screenshot(path=screenshot_path, full_page=True)
        page.get_by_role("button", name="Submit").click()
        page.wait_for_timeout(2000)
        browser.close()

def screenshot_airtable_sync(screenshot_path: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(AIRTABLE_SHARE_URL)
        page.wait_for_timeout(2000)
        try:
            page.get_by_role("button", name="Reject All, Except Strictly Necessary").click(timeout=3000)
        except Exception:
            pass
        page.wait_for_timeout(500)
        page.screenshot(path=screenshot_path, full_page=True)
        browser.close()

def screenshot_email_sync(subject: str, body: str, screenshot_path: str):
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; margin: 0; padding: 40px 20px; }}
            .card {{ max-width: 580px; margin: 0 auto; background: #0f172a; border-radius: 12px; border: 1px solid #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden; color: #f1f5f9; }}
            .header {{ background: #1e293b; color: #38bdf8; padding: 20px 24px; font-weight: 600; font-size: 15px; border-bottom: 1px solid #334155; }}
            .content {{ padding: 24px; color: #cbd5e1; line-height: 1.6; font-size: 14px; white-space: pre-wrap; }}
            .footer {{ background: #020617; padding: 14px 24px; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <span style="color: #94a3b8; font-weight: 400;">Subject:</span> {subject}
            </div>
            <div class="content">{body}</div>
            <div class="footer">Automated Customer Response Demo • Agents for Humans</div>
        </div>
    </body>
    </html>
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_content(html_content)
        page.wait_for_timeout(500)
        page.screenshot(path=screenshot_path)
        browser.close()

async def build_real_demo(business_name: str, research_profile: str) -> dict:
    os.makedirs("screenshots", exist_ok=True)
    safe_name = business_name.replace(" ", "_").replace("/", "_")

    # 1. Invent a lead with a fake email, submit the Tally form
    name, fake_email, inquiry = await invent_demo_lead(business_name, research_profile)
    form_screenshot = f"screenshots/{safe_name}_form.png"
    
    await asyncio.to_thread(submit_demo_form_sync, name, fake_email, inquiry, form_screenshot)
    record_id = save_lead_now(name, fake_email, inquiry)

    # 2. Screenshot the CRM while this is the only "New" row, then archive it
    airtable_screenshot = f"screenshots/{safe_name}_airtable.png"
    await asyncio.to_thread(screenshot_airtable_sync, airtable_screenshot)
    archive_lead_now(record_id)

    # 3. Draft the reply and capture the HTML screenshot locally
    subject, body = await draft_demo_reply(business_name, research_profile, name, inquiry)
    email_screenshot = f"screenshots/{safe_name}_email.png"
    await asyncio.to_thread(screenshot_email_sync, subject, body, email_screenshot)

    return {
        "lead_name": name,
        "lead_email": fake_email,
        "inquiry": inquiry,
        "form_screenshot": form_screenshot,
        "airtable_screenshot": airtable_screenshot,
        "email_screenshot": email_screenshot,
    }

# ---- Stage 4: Short & High-Converting Pitch Drafting ----
OUTREACH_SYSTEM_PROMPT = """You are an elite B2B automation freelancer writing a quick, high-converting cold email to a business owner.

Keep the email SHORT, warm, and natural (under 100 words total).

Structure:
1. Short, friendly opening referencing their business.
2. Mention that manual customer follow-ups and lead logging often take up hours of time.
3. State that you built a quick functional automation prototype for them (referencing the 3 attached screenshots: Form, Real-time CRM log, and Auto-reply email).
4. Direct soft CTA: Ask if they have 5 minutes for a quick demo call or want to automate other manual tasks.

RULES:
- Do NOT use markdown formatting like asterisks (**bold** or *italic*). Output pure plain text only.
- Keep sentences short and direct.
- End the sign-off strictly with:
Best regards,
[User Name]

Respond in this format:
SUBJECT: <subject line>
BODY: <email body>
"""

outreach_agent = Agent(model=model, tools=[], system_prompt=OUTREACH_SYSTEM_PROMPT, callback_handler=None)

async def draft_outreach_pitch(business_name: str, research_profile: str) -> tuple[str, str]:
    prompt = f"Business Name: {business_name}\nResearch Profile:\n{research_profile}"
    response = await outreach_agent.invoke_async(prompt)
    res_str = str(response).strip()

    subject = f"Quick automation concept for {business_name}"
    body = (
        f"Hi,\n\n"
        f"I came across {business_name} and put together a quick live prototype to automate your client intake and follow-ups.\n\n"
        f"I attached 3 quick screenshots showing how it works:\n"
        f"1. Intake form for instant customer details\n"
        f"2. Automated CRM record creation\n"
        f"3. Instant custom email response\n\n"
        f"This saves 5-10 hours a week on repetitive follow-ups. Would you be open to a 5-minute call this week to see it live?\n\n"
        f"Best regards,\n[User Name]"
    )

    if "SUBJECT:" in res_str and "BODY:" in res_str:
        try:
            parts = res_str.split("BODY:", 1)
            subject_part = parts[0].replace("SUBJECT:", "").strip()
            body_part = parts[1].strip()
            if subject_part: subject = subject_part
            if body_part: body = body_part
        except Exception:
            pass

    return subject, body