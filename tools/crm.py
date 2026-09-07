import os
from pyairtable import Api
from strands import tool

def save_lead_now(name: str, email: str, inquiry: str) -> str:
    """Writes to Airtable and returns the new record's ID."""
    api = Api(os.getenv("AIRTABLE_TOKEN"))
    table = api.table(os.getenv("AIRTABLE_BASE_ID"), os.getenv("AIRTABLE_TABLE_NAME"))
    record = table.create({
        "Name": name,
        "Email": email,
        "Inquiry": inquiry,
        "Status": "New"
    })
    return record["id"]

def archive_lead_now(record_id: str):
    """Marks a lead as no longer 'New' so it drops out of the shared demo view."""
    api = Api(os.getenv("AIRTABLE_TOKEN"))
    table = api.table(os.getenv("AIRTABLE_BASE_ID"), os.getenv("AIRTABLE_TABLE_NAME"))
    table.update(record_id, {"Status": "Demo Sent"})

def cleanup_stray_new_leads(except_record_id: str):
    """Archives any other leads still stuck on 'New' status.

    This is a safety net: if a previous run crashed after saving a lead but
    before archiving it (e.g. the screenshot step failed), that old lead
    would stay stuck on 'New' forever and clutter up the Live Demo view
    alongside the current lead. This runs right before every screenshot to
    sweep away any such leftovers, so the view only ever shows the one
    lead we actually want in the current screenshot.
    """
    api = Api(os.getenv("AIRTABLE_TOKEN"))
    table = api.table(os.getenv("AIRTABLE_BASE_ID"), os.getenv("AIRTABLE_TABLE_NAME"))
    stray_records = table.all(formula="{Status} = 'New'")
    for rec in stray_records:
        if rec["id"] != except_record_id:
            table.update(rec["id"], {"Status": "Demo Sent"})

@tool
def create_lead_record(name: str, email: str, inquiry: str) -> str:
    """Create a new lead record in the demo Airtable base, simulating a
    business's CRM automatically capturing a new form submission.
    Args:
        name: The lead's name
        email: The lead's email address
        inquiry: What the lead is asking about
    """
    record_id = save_lead_now(name, email, inquiry)
    return f"Lead saved to Airtable with record ID {record_id}"
