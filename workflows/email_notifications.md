# Email Notifications Workflow

## Objective
Send automated email notifications for invoice reminders, client updates, and weekly summaries.

## Required Inputs
- Recipient email address
- Template type or custom subject/body
- Template data (invoice, client, or report data)

## Prerequisites
- SMTP credentials configured in `.env`:
  - `SMTP_HOST` (e.g., `smtp.gmail.com`)
  - `SMTP_PORT` (default: `587`)
  - `SMTP_USER` (your email)
  - `SMTP_PASSWORD` (app password, not account password)
  - `SMTP_FROM` (optional, defaults to SMTP_USER)

## Tools
- `tools/send_email.py` — SMTP email sender
- `tools/email_templates.py` — Pre-built HTML/text templates

## Available Templates

### Invoice Reminder
```bash
echo '{"to": "client@example.com", "template": "invoice_reminder", "template_data": {"invoiceNumber": "INV-001", "clientName": "John", "total": 5000, "dueDate": "2026-04-15"}}' | python tools/send_email.py
```

### Client Update
```bash
echo '{"to": "client@example.com", "template": "client_update", "template_data": {"clientName": "John", "companyName": "Acme", "serviceType": "AI Agents", "milestones": 60, "roadmapStage": "Development"}}' | python tools/send_email.py
```

### Weekly Summary
```bash
echo '{"to": "ceo@aeitron.com", "template": "weekly_summary", "template_data": {"summary": {"totalClients": 12, "totalLeads": 8, "totalInvoices": 5, "totalAutomations": 3}}}' | python tools/send_email.py
```

### Custom Email
```bash
echo '{"to": "someone@example.com", "subject": "Custom Subject", "body_text": "Plain text body", "body_html": "<h1>HTML body</h1>"}' | python tools/send_email.py
```

## Steps
1. Identify the notification type and recipient
2. Gather the required data (invoice details, client info, etc.)
3. Run `send_email.py` with the appropriate template or custom content
4. Check output for success/failure

## Edge Cases
- Gmail requires an "App Password" (not your regular password) with 2FA enabled
- Rate limits: Gmail allows ~500 emails/day for regular accounts
- If SMTP is not configured, the tool returns a clear error message
- HTML emails include plain text fallback for email clients that don't render HTML
