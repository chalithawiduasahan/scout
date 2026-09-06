import os
import requests

def send_slack_lead_notification(business_name: str, customer_name: str, customer_email: str, inquiry: str) -> str:
    """
    Sends a rich Slack notification to the business team alerting them of a new lead.
    """
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    
    # Fallback simulation if webhook isn't configured yet so the code never crashes
    if not webhook_url:
        print(f"[Slack Simulation] Notification sent for {business_name}: New lead from {customer_name} ({customer_email})")
        return "Slack notification simulated successfully."

    payload = {
        "text": f"🚨 *New Potential Lead for {business_name}!*",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*New Potential Lead Captured!* :fire:\n*Business:* {business_name}"
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Customer Name:*\n{customer_name}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Email:*\n{customer_email}"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Inquiry:*\n> {inquiry}"
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "⚡ Powered by Scout Automation Engine"
                    }
                ]
            }
        ]
    }

    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        if response.status_code == 200:
            return "Slack notification sent successfully."
        else:
            print(f"Slack webhook error: {response.text}")
            return "Failed to send Slack notification via webhook."
    except Exception as e:
        print(f"Slack notification error: {e}")
        return str(e)