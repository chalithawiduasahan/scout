import os
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from agent import find_businesses, research_business, build_real_demo, draft_outreach_pitch
from tools.outreach import send_email_with_attachments

app = FastAPI(title="Agents for Humans API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("screenshots", exist_ok=True)
app.mount("/screenshots", StaticFiles(directory="screenshots"), name="screenshots")

class ResearchRequest(BaseModel):
    niche: str
    location: str
    scale: str = "small"

class RegenerateRequest(BaseModel):
    business_name: str
    research_profile: str

class SendOutreachRequest(BaseModel):
    recipient_email: str
    subject: str
    body: str
    attachment_paths: List[str]

@app.get("/")
async def serve_index():
    return FileResponse("index.html")

@app.post("/api/start-agent")
async def start_agent_pipeline(request: ResearchRequest):
    try:
        print(f"\n--- API Request Received: Niche='{request.niche}', Location='{request.location}', Scale='{request.scale}' ---")
        
        # 1. Discover
        print("Finding targeted businesses...")
        businesses = await find_businesses(request.niche, request.location, request.scale)
        if not businesses:
            raise HTTPException(status_code=404, detail="No businesses found matching these criteria.")
        
        target_business = businesses[0]
        print(f"Target business selected: {target_business}")
        
        # 2. Research
        print("Researching business profile...")
        profile = await research_business(target_business)
        
        # 3. Build Demo
        print("Building live demo & capturing screenshots...")
        demo_result = await build_real_demo(target_business, profile)
        
        # 4. Draft Pitch
        print("Drafting high-converting outreach pitch...")
        subject, body = await draft_outreach_pitch(target_business, profile)
        
        attachments = [
            demo_result["form_screenshot"],
            demo_result["airtable_screenshot"],
            demo_result["email_screenshot"]
        ]
        
        print("--- Pipeline Finished Successfully! ---")
        return {
            "status": "success",
            "data": {
                "business_name": target_business,
                "research_profile": profile,
                "demo_result": demo_result,
                "draft_subject": subject,
                "draft_body": body,
                "attachments": attachments
            }
        }
    except Exception as e:
        print("ERROR IN PIPELINE:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/regenerate-outreach")
async def regenerate_outreach(request: RegenerateRequest):
    try:
        print(f"Regenerating pitch for: {request.business_name}...")
        subject, body = await draft_outreach_pitch(request.business_name, request.research_profile)
        return {
            "status": "success",
            "draft_subject": subject,
            "draft_body": body
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/send-outreach")
async def send_outreach(request: SendOutreachRequest):
    try:
        status = send_email_with_attachments(
            to_email=request.recipient_email,
            subject=request.subject,
            body=request.body,
            attachment_paths=request.attachment_paths
        )
        return {"status": "success", "message": status}
    except Exception as e:
        print("ERROR SENDING OUTREACH:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)