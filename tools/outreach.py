import os
import boto3
from strands import tool

def send_email_now(to_email: str, subject: str, body: str) -> str:
    """Actually sends the email via SES. Callable directly from our own
    code — not just something the agent can trigger on its own."""
    ses = boto3.client("ses", region_name="us-east-1")
    ses.send_email(
        Source=os.getenv("SES_SENDER_EMAIL"),
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Text": {"Data": body}},
        },
    )
    return f"Follow-up email sent to {to_email}"

@tool
def send_followup_email(to_email: str, subject: str, body: str) -> str:
    """Send a personalized follow-up email via Amazon SES, simulating a
    business's automated response to a new lead.

    Args:
        to_email: Recipient email address (must be SES-verified while in sandbox mode)
        subject: Email subject line
        body: Email body text
    """
    return send_email_now(to_email, subject, body)