"""Send emails via SMTP.

Usage:
    echo '{"to": "x@y.com", "subject": "...", "body_html": "...", "body_text": "..."}' | python tools/send_email.py

Environment variables (from .env):
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM

Input JSON:
    to: recipient email
    subject: email subject
    body_html: HTML body (optional)
    body_text: plain text body
    template: optional - "invoice_reminder" | "client_update" | "weekly_summary"
    template_data: data to pass to template function (if template is set)

Output JSON:
    success: bool
    message: string
"""

import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils import read_json_input, write_json_output, get_env


def build_email(to_addr, subject, body_html=None, body_text=""):
    """Build a MIME email message."""
    from_addr = get_env("SMTP_FROM", get_env("SMTP_USER", "noreply@aeitron.com"))

    if body_html:
        msg = MIMEMultipart("alternative")
        msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))
    else:
        msg = MIMEText(body_text, "plain")

    msg["From"] = from_addr
    msg["To"] = to_addr
    msg["Subject"] = subject
    return msg, from_addr


def send_smtp(msg, from_addr, to_addr):
    """Send email via SMTP."""
    host = get_env("SMTP_HOST")
    port = int(get_env("SMTP_PORT", "587"))
    user = get_env("SMTP_USER")
    password = get_env("SMTP_PASSWORD")

    if not host or not user or not password:
        raise ValueError(
            "SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env"
        )

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(user, password)
        server.sendmail(from_addr, [to_addr], msg.as_string())


def main():
    try:
        data = read_json_input()

        # Handle template-based emails
        template = data.get("template")
        if template:
            import email_templates

            template_data = data.get("template_data", {})
            func = getattr(email_templates, template, None)
            if not func:
                raise ValueError(f"Unknown template: {template}")
            result = func(template_data)
            data["subject"] = result["subject"]
            data["body_html"] = result["body_html"]
            data["body_text"] = result["body_text"]

        to_addr = data.get("to")
        if not to_addr:
            raise ValueError("Missing 'to' field")

        subject = data.get("subject", "(No Subject)")
        body_html = data.get("body_html")
        body_text = data.get("body_text", "")

        msg, from_addr = build_email(to_addr, subject, body_html, body_text)
        send_smtp(msg, from_addr, to_addr)

        write_json_output({
            "success": True,
            "message": f"Email sent to {to_addr}",
        })

    except Exception as e:
        write_json_output({"success": False, "error": str(e)})
        sys.exit(1)


if __name__ == "__main__":
    main()
