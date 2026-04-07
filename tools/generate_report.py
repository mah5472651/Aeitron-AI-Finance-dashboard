"""Generate a PDF financial summary report.

Usage:
    python tools/generate_report.py report_data.json

Input JSON: Full dashboard report (same shape as DownloadReportButton JSON output)
    - summary: { totalClients, totalLeads, totalInvoices, totalAutomations }
    - clients: [...]
    - expenses: [...]
    - invoices: [...]
    - leads: [...]

Output JSON:
    success: bool
    path: string
"""

import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils import read_json_input, write_json_output, ensure_tmp_dir, format_currency


def generate_pdf_report(data):
    from fpdf import FPDF

    output_dir = ensure_tmp_dir("reports")
    ts = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    filepath = output_dir / f"financial_report_{ts}.pdf"

    clients = data.get("clients", [])
    expenses = data.get("expenses", [])
    invoices = data.get("invoices", [])
    leads = data.get("leads", [])

    # Calculate metrics
    total_revenue = sum(c.get("amountPaid", 0) for c in clients)
    total_project_value = sum(c.get("totalProjectValue", 0) for c in clients)
    outstanding = total_project_value - total_revenue
    total_expenses = sum(e.get("amount", 0) for e in expenses)
    net_profit = total_revenue - total_expenses
    pipeline_value = sum(l.get("dealValue", 0) for l in leads)
    total_invoiced = sum(inv.get("total", 0) for inv in invoices)
    paid_invoices = sum(inv.get("total", 0) for inv in invoices if inv.get("status") == "Paid")
    overdue_invoices = [inv for inv in invoices if inv.get("status") == "Overdue"]

    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "Aeitron AI - Financial Report", ln=True, align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", ln=True, align="C")
    pdf.ln(10)

    # Summary Section
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Financial Summary", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)

    pdf.set_font("Helvetica", "", 11)
    summary_items = [
        ("Total Revenue", format_currency(total_revenue)),
        ("Total Expenses", format_currency(total_expenses)),
        ("Net Profit", format_currency(net_profit)),
        ("Outstanding Dues", format_currency(outstanding)),
        ("Pipeline Value", format_currency(pipeline_value)),
        ("Total Invoiced", format_currency(total_invoiced)),
        ("Invoices Paid", format_currency(paid_invoices)),
    ]
    for label, value in summary_items:
        pdf.cell(80, 8, label, border=0)
        pdf.cell(0, 8, value, border=0, ln=True)
    pdf.ln(5)

    # Expense Breakdown
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Expense Breakdown", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)

    categories = {}
    for e in expenses:
        cat = e.get("category", "Other")
        categories[cat] = categories.get(cat, 0) + e.get("amount", 0)

    pdf.set_font("Helvetica", "B", 9)
    pdf.cell(95, 8, "Category", border=1, align="C")
    pdf.cell(95, 8, "Amount", border=1, align="C", ln=True)

    pdf.set_font("Helvetica", "", 9)
    for cat, amount in sorted(categories.items(), key=lambda x: -x[1]):
        pdf.cell(95, 7, cat, border=1)
        pdf.cell(95, 7, format_currency(amount), border=1, align="R", ln=True)
    pdf.ln(5)

    # Clients Overview
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, f"Client Overview ({len(clients)} clients)", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)

    if clients:
        col_w = [50, 40, 35, 35, 30]
        headers = ["Client", "Company", "Service", "Value", "Paid"]
        pdf.set_font("Helvetica", "B", 8)
        for i, h in enumerate(headers):
            pdf.cell(col_w[i], 7, h, border=1, align="C")
        pdf.ln()

        pdf.set_font("Helvetica", "", 8)
        for c in clients[:20]:  # Limit to 20 rows
            pdf.cell(col_w[0], 6, str(c.get("clientName", ""))[:25], border=1)
            pdf.cell(col_w[1], 6, str(c.get("companyName", ""))[:20], border=1)
            pdf.cell(col_w[2], 6, str(c.get("serviceType", ""))[:18], border=1)
            pdf.cell(col_w[3], 6, format_currency(c.get("totalProjectValue", 0)), border=1, align="R")
            pdf.cell(col_w[4], 6, format_currency(c.get("amountPaid", 0)), border=1, align="R")
            pdf.ln()

        if len(clients) > 20:
            pdf.set_font("Helvetica", "I", 8)
            pdf.cell(0, 6, f"... and {len(clients) - 20} more clients", ln=True)
    pdf.ln(5)

    # Overdue Invoices
    if overdue_invoices:
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, f"Overdue Invoices ({len(overdue_invoices)})", ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(3)

        pdf.set_font("Helvetica", "B", 9)
        pdf.cell(40, 7, "Invoice #", border=1, align="C")
        pdf.cell(50, 7, "Client", border=1, align="C")
        pdf.cell(45, 7, "Due Date", border=1, align="C")
        pdf.cell(55, 7, "Amount", border=1, align="C", ln=True)

        pdf.set_font("Helvetica", "", 9)
        for inv in overdue_invoices:
            pdf.cell(40, 7, str(inv.get("invoiceNumber", "")), border=1)
            pdf.cell(50, 7, str(inv.get("clientName", ""))[:25], border=1)
            pdf.cell(45, 7, str(inv.get("dueDate", "")), border=1)
            pdf.cell(55, 7, format_currency(inv.get("total", 0)), border=1, align="R", ln=True)

    # Lead Pipeline
    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, f"Lead Pipeline ({len(leads)} leads)", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)

    stages = {}
    for l in leads:
        stage = l.get("stage", "Unknown")
        stages[stage] = stages.get(stage, 0) + 1

    pdf.set_font("Helvetica", "", 10)
    for stage, count in stages.items():
        pdf.cell(80, 7, stage)
        pdf.cell(0, 7, str(count), ln=True)

    pdf.output(str(filepath))
    return str(filepath)


def main():
    try:
        data = read_json_input()
        path = generate_pdf_report(data)
        write_json_output({"success": True, "path": path})
    except Exception as e:
        write_json_output({"success": False, "error": str(e)})
        sys.exit(1)


if __name__ == "__main__":
    main()
