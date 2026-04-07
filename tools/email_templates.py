"""Email templates for automated notifications.

Provides template functions that return { subject, body_html, body_text }.
"""

from utils import format_currency, format_date


def invoice_reminder(invoice):
    """Generate an invoice reminder email."""
    subject = f"Payment Reminder - Invoice {invoice.get('invoiceNumber', 'N/A')}"

    body_text = f"""Hi {invoice.get('clientName', 'there')},

This is a friendly reminder that Invoice {invoice.get('invoiceNumber', '')} for {format_currency(invoice.get('total', 0))} is due on {format_date(invoice.get('dueDate', ''))}.

Invoice Details:
- Invoice #: {invoice.get('invoiceNumber', '')}
- Amount: {format_currency(invoice.get('total', 0))}
- Due Date: {format_date(invoice.get('dueDate', ''))}
- Status: {invoice.get('status', '')}

Please arrange payment at your earliest convenience.

Best regards,
Aeitron AI Team
"""

    body_html = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0;">Payment Reminder</h2>
    </div>
    <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <p>Hi {invoice.get('clientName', 'there')},</p>
        <p>This is a friendly reminder about your outstanding invoice:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: bold;">Invoice #</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">{invoice.get('invoiceNumber', '')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: bold;">Amount Due</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">{format_currency(invoice.get('total', 0))}</td>
            </tr>
            <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; font-weight: bold;">Due Date</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">{format_date(invoice.get('dueDate', ''))}</td>
            </tr>
        </table>
        <p>Please arrange payment at your earliest convenience.</p>
        <p>Best regards,<br>Aeitron AI Team</p>
    </div>
</div>
"""
    return {"subject": subject, "body_html": body_html, "body_text": body_text}


def client_update(client, message=""):
    """Generate a client project update email."""
    subject = f"Project Update - {client.get('companyName', client.get('clientName', 'Your Project'))}"

    progress = client.get("milestones", 0)
    stage = client.get("roadmapStage", "In Progress")

    body_text = f"""Hi {client.get('clientName', 'there')},

Here's an update on your project with Aeitron AI:

Project: {client.get('serviceType', 'N/A')}
Current Stage: {stage}
Progress: {progress}%

{message if message else 'We are making steady progress and will keep you updated on milestones.'}

Best regards,
Aeitron AI Team
"""

    body_html = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0;">Project Update</h2>
    </div>
    <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <p>Hi {client.get('clientName', 'there')},</p>
        <p>Here's the latest on your project:</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Service:</strong> {client.get('serviceType', 'N/A')}</p>
            <p style="margin: 4px 0;"><strong>Stage:</strong> {stage}</p>
            <p style="margin: 4px 0;"><strong>Progress:</strong> {progress}%</p>
            <div style="background: #e5e7eb; border-radius: 4px; height: 8px; margin-top: 8px;">
                <div style="background: #22c55e; border-radius: 4px; height: 8px; width: {progress}%;"></div>
            </div>
        </div>
        <p>{message if message else 'We are making steady progress and will keep you updated on milestones.'}</p>
        <p>Best regards,<br>Aeitron AI Team</p>
    </div>
</div>
"""
    return {"subject": subject, "body_html": body_html, "body_text": body_text}


def weekly_summary(report_data):
    """Generate a weekly summary email from report data."""
    summary = report_data.get("summary", {})
    subject = "Aeitron AI - Weekly Financial Summary"

    body_text = f"""Weekly Financial Summary

Clients: {summary.get('totalClients', 0)}
Leads: {summary.get('totalLeads', 0)}
Invoices: {summary.get('totalInvoices', 0)}
Automations: {summary.get('totalAutomations', 0)}

Generated: {report_data.get('generatedAt', 'N/A')}

Best regards,
Aeitron AI System
"""

    body_html = f"""
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #1a1a2e; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0;">Weekly Summary</h2>
    </div>
    <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e7eb;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0;">
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">{summary.get('totalClients', 0)}</p>
                <p style="color: #6b7280; margin: 4px 0 0;">Clients</p>
            </div>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">{summary.get('totalLeads', 0)}</p>
                <p style="color: #6b7280; margin: 4px 0 0;">Leads</p>
            </div>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">{summary.get('totalInvoices', 0)}</p>
                <p style="color: #6b7280; margin: 4px 0 0;">Invoices</p>
            </div>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center;">
                <p style="font-size: 24px; font-weight: bold; margin: 0;">{summary.get('totalAutomations', 0)}</p>
                <p style="color: #6b7280; margin: 4px 0 0;">Automations</p>
            </div>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">Auto-generated by Aeitron AI</p>
    </div>
</div>
"""
    return {"subject": subject, "body_html": body_html, "body_text": body_text}
