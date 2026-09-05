import os
import boto3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from strands import tool

def send_email_now(to_email: str, subject: str, body: str) -> str:
    ses = boto3.client("ses", region_name="us-east-1")
    ses.send_email(
        Source=os.getenv("SES_SENDER_EMAIL"),
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Text": {"Data": body}},
        },
    )
    return f"Email sent to {to_email}"

def send_email_with_attachments(to_email: str, subject: str, body: str, attachment_paths: list[str]) -> str:
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = os.getenv("SES_SENDER_EMAIL")
    msg["To"] = to_email
    msg.attach(MIMEText(body, "plain"))

    for path in attachment_paths:
        with open(path, "rb") as f:
            img = MIMEImage(f.read())
            img.add_header("Content-Disposition", "attachment", filename=os.path.basename(path))
            msg.attach(img)

    ses = boto3.client("ses", region_name="us-east-1")
    ses.send_raw_email(
        Source=os.getenv("SES_SENDER_EMAIL"),
        Destinations=[to_email],
        RawMessage={"Data": msg.as_string()},
    )
    return f"Outreach email with attachments sent to {to_email}"

@tool
def send_followup_email(to_email: str, subject: str, body: str) -> str:
    """Send a personalized follow-up email via Amazon SES.

    Args:
        to_email: Recipient email address (must be SES-verified while in sandbox mode)
        subject: Email subject line
        body: Email body text
    """
    return send_email_now(to_email, subject, body)