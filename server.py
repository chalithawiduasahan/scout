import os
import random
import uuid
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from supabase import create_client, Client

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

# Initialize Supabase Client securely on the backend
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Optional[Client] = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

SCREENSHOTS_BUCKET = "screenshots"

# ---------------------------------------------------------------------------
# DEMO MODE SAFETY LOCK
# ---------------------------------------------------------------------------
# This app is a public hackathon demo. Anyone can visit it, research a REAL
# business, and click "Approve & send." Without this override, that would
# send a real, unsolicited email to a real business the visitor doesn't know
# and never contacted. To prevent that, every outreach send in this app is
# hard-redirected to a single verified test inbox, no matter what recipient
# the client asks for.
#
# IMPORTANT: this check happens here, server-side, not in the frontend.
# The frontend UI is just for transparency - it cannot be trusted as the
# actual safety boundary, since anyone can call this API directly (curl,
# Postman, browser devtools) and bypass any frontend-only restriction.
SES_TEST_RECIPIENT = os.getenv("SES_TEST_RECIPIENT")

if not SES_TEST_RECIPIENT:
    # Fail loudly at startup rather than silently falling back to sending
    # real emails to whatever the client requests.
    raise RuntimeError(
        "SES_TEST_RECIPIENT is not set. Refusing to start: without it, "
        "outreach emails could be sent to real, uncontacted businesses."
    )


def upload_screenshot_to_storage(local_path: Optional[str]) -> Optional[str]:
    """Uploads a local screenshot file to Supabase Storage and returns its
    permanent public URL. Falls back to returning the original local path if
    Supabase isn't configured or the file can't be found, so nothing crashes
    if something's off - it just won't be a permanent link in that case."""
    if not supabase or not local_path or not os.path.exists(local_path):
        return local_path

    try:
        file_ext = os.path.splitext(local_path)[1] or ".png"
        # Prefix with a random id so re-running the same business name never
        # overwrites a previous screenshot already linked from history.
        storage_path = f"{uuid.uuid4().hex}{file_ext}"

        with open(local_path, "rb") as f:
            supabase.storage.from_(SCREENSHOTS_BUCKET).upload(
                path=storage_path,
                file=f,
                file_options={"content-type": "image/png"}
            )

        public_url = supabase.storage.from_(SCREENSHOTS_BUCKET).get_public_url(storage_path)
        return public_url
    except Exception:
        print(f"WARNING: Failed to upload {local_path} to Supabase Storage:")
        traceback.print_exc()
        return local_path

class ResearchRequest(BaseModel):
    user_name: str
    niche: str
    location: str
    scale: str = "small"
    count: int = 1

class RegenerateRequest(BaseModel):
    business_name: str
    research_profile: str

class SendOutreachRequest(BaseModel):
    user_name: str
    niche: str
    location: str
    scale: str
    recipient_email: str
    subject: str
    body: str
    business_name: str
    form_screenshot: str
    airtable_screenshot: str
    email_screenshot: str
    slack_screenshot: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Scout API is running!"}

@app.post("/api/start-agent")
async def start_agent_pipeline(request: ResearchRequest):
    try:
        print(f"\n--- API Request Received: User='{request.user_name}', Niche='{request.niche}', Location='{request.location}', Scale='{request.scale}', Count={request.count} ---")

        excluded_businesses = []
        if supabase:
            history_res = supabase.table("outreach_history").select("business_name").eq("user_name", request.user_name).execute()
            if history_res.data:
                excluded_businesses = [item["business_name"] for item in history_res.data]
                print(f"Excluding previously contacted businesses for {request.user_name}: {excluded_businesses}")

        print("Finding targeted businesses...")
        businesses = await find_businesses(request.niche, request.location, request.scale, excluded_businesses)
        if not businesses:
            raise HTTPException(status_code=404, detail="No new businesses found matching these criteria (all potential matches were previously contacted by you).")

        run_count = min(request.count, len(businesses))
        batch_results = []
        available_pool = list(businesses)

        for i in range(run_count):
            if not available_pool:
                break

            target_business = random.choice(available_pool)
            available_pool.remove(target_business)
            print(f"[{i+1}/{run_count}] Target business selected (Random): {target_business}")

            print(f"Researching business profile for {target_business}...")
            profile = await research_business(target_business, request.location)

            print(f"Building live demo & capturing screenshots for {target_business}...")
            demo_result = await build_real_demo(target_business, profile)

            print(f"Drafting high-converting outreach pitch for {target_business}...")
            subject, body = await draft_outreach_pitch(target_business, profile)

            batch_results.append({
                "business_name": target_business,
                "research_profile": profile,
                "demo_result": demo_result,
                "draft_subject": subject,
                "draft_body": body,
            })

        print("--- Pipeline Batch Finished Successfully! ---")
        return {
            "status": "success",
            "data": batch_results
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
        # -------------------------------------------------------------
        # DEMO MODE OVERRIDE - see comment near SES_TEST_RECIPIENT above.
        # Whatever recipient_email the client sent (the real business
        # email discovered during research) is recorded for reference
        # only. The actual email always goes to the verified test inbox.
        # This line is the entire safety mechanism - it is intentionally
        # unconditional and not driven by any client-supplied value.
        # -------------------------------------------------------------
        researched_business_email = request.recipient_email
        actual_send_target = SES_TEST_RECIPIENT

        print(
            f"[DEMO MODE] Researched business contact was '{researched_business_email}'. "
            f"Actual send is redirected to verified test inbox '{actual_send_target}'."
        )

        # Send the actual email using the LOCAL files (real attachments need
        # a real file on disk - this part is unaffected and unchanged).
        attachments = [
            request.form_screenshot,
            request.airtable_screenshot,
            request.email_screenshot
        ]
        if request.slack_screenshot:
            attachments.append(request.slack_screenshot)

        status = send_email_with_attachments(
            to_email=actual_send_target,
            subject=request.subject,
            body=request.body,
            attachment_paths=attachments
        )

        # Now upload the same screenshots to permanent Supabase Storage and
        # save THOSE URLs to history, instead of the local paths, so History
        # keeps working even after the server restarts or redeploys.
        if supabase:
            form_url = upload_screenshot_to_storage(request.form_screenshot)
            airtable_url = upload_screenshot_to_storage(request.airtable_screenshot)
            email_url = upload_screenshot_to_storage(request.email_screenshot)
            slack_url = upload_screenshot_to_storage(request.slack_screenshot) if request.slack_screenshot else None

            supabase.table("outreach_history").insert({
                "user_name": request.user_name,
                "business_name": request.business_name,
                "niche": request.niche,
                "location": request.location,
                "scale": request.scale,
                # Store the ACTUAL destination the email was sent to (the
                # verified test inbox), not the researched business email,
                # so the History tab accurately reflects what really
                # happened rather than implying a real send occurred.
                "recipient_email": actual_send_target,
                "subject": request.subject,
                "body": request.body,
                "form_screenshot": form_url,
                "airtable_screenshot": airtable_url,
                "email_screenshot": email_url,
                "slack_screenshot": slack_url,
            }).execute()

        return {
            "status": "success",
            "message": status,
            "note": f"Demo mode: sent to verified test inbox instead of {researched_business_email}",
        }
    except Exception as e:
        print("ERROR SENDING OUTREACH:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history(user_name: Optional[str] = None):
    try:
        if not supabase:
            return {"status": "success", "data": []}

        query = supabase.table("outreach_history").select("*").order("created_at", desc=True)
        if user_name:
            query = query.eq("user_name", user_name)

        response = query.execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        print("ERROR FETCHING HISTORY:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Serve static frontend files if built by Docker
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("screenshots/"):
            raise HTTPException(status_code=404, detail="Not found")
        return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
