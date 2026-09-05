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