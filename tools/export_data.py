"""Export dashboard data to CSV or PDF format.

Usage:
    echo '{"type": "clients", "format": "csv", "data": [...]}' | python tools/export_data.py
    python tools/export_data.py input.json

Input JSON:
    type: "clients" | "expenses" | "invoices" | "leads" | "team"
    format: "csv" | "pdf"
    data: array of records

Output JSON:
    success: bool
    path: string (path to generated file)
"""

import sys
import csv
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils import read_json_input, write_json_output, ensure_tmp_dir, timestamp_filename, format_currency

# Column definitions per data type
COLUMNS = {
    "clients": [
        ("clientName", "Client Name"),
        ("companyName", "Company"),
        ("serviceType", "Service Type"),
        ("onboardingStatus", "Onboarding Status"),
        ("paymentCategory", "Payment Category"),
        ("totalProjectValue", "Total Value"),
        ("amountPaid", "Amount Paid"),
        ("milestones", "Progress %"),
        ("createdAt", "Created"),
    ],
    "expenses": [
        ("description", "Description"),
        ("category", "Category"),
        ("amount", "Amount"),
        ("date", "Date"),
        ("recurring", "Recurring"),
    ],
    "invoices": [
        ("invoiceNumber", "Invoice #"),
        ("clientName", "Client"),
        ("companyName", "Company"),
        ("status", "Status"),
        ("issueDate", "Issue Date"),
        ("dueDate", "Due Date"),
        ("total", "Total"),
    ],
    "leads": [
        ("name", "Name"),
        ("company", "Company"),
        ("email", "Email"),
        ("stage", "Stage"),
        ("dealValue", "Deal Value"),
        ("createdAt", "Created"),
    ],
    "team": [
        ("name", "Name"),
        ("role", "Role"),
        ("email", "Email"),
        ("rate", "Rate"),
        ("status", "Status"),
    ],
}


def export_csv(data_type, records):
    """Export records to CSV file."""
    output_dir = ensure_tmp_dir("exports")
    filename = timestamp_filename(data_type, "csv")
    filepath = output_dir / filename

    cols = COLUMNS.get(data_type, [])
    if not cols:
        raise ValueError(f"Unknown data type: {data_type}")

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([label for _, label in cols])
        for record in records:
            row = [record.get(key, "") for key, _ in cols]
            writer.writerow(row)

    return str(filepath)


def export_pdf(data_type, records):
    """Export records to PDF file."""
    from fpdf import FPDF

    output_dir = ensure_tmp_dir("exports")
    filename = timestamp_filename(data_type, "pdf")
    filepath = output_dir / filename

    cols = COLUMNS.get(data_type, [])
    if not cols:
        raise ValueError(f"Unknown data type: {data_type}")

    pdf = FPDF(orientation="L", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, f"Aeitron - {data_type.title()} Export", ln=True, align="C")
    pdf.ln(5)

    # Table header
    pdf.set_font("Helvetica", "B", 9)
    col_width = (pdf.w - 20) / len(cols)
    for _, label in cols:
        pdf.cell(col_width, 8, label, border=1, align="C")
    pdf.ln()

    # Table rows
    pdf.set_font("Helvetica", "", 8)
    for record in records:
        for key, _ in cols:
            val = record.get(key, "")
            if isinstance(val, (int, float)) and key in ("totalProjectValue", "amountPaid", "amount", "total", "dealValue", "rate"):
                val = format_currency(val)
            elif isinstance(val, bool):
                val = "Yes" if val else "No"
            pdf.cell(col_width, 7, str(val)[:30], border=1)
        pdf.ln()

    pdf.output(str(filepath))
    return str(filepath)


def main():
    try:
        input_data = read_json_input()
        data_type = input_data.get("type", "clients")
        fmt = input_data.get("format", "csv")
        records = input_data.get("data", [])

        if fmt == "csv":
            path = export_csv(data_type, records)
        elif fmt == "pdf":
            path = export_pdf(data_type, records)
        else:
            raise ValueError(f"Unsupported format: {fmt}")

        write_json_output({
            "success": True,
            "path": path,
            "records": len(records),
            "format": fmt,
        })

    except Exception as e:
        write_json_output({"success": False, "error": str(e)})
        sys.exit(1)


if __name__ == "__main__":
    main()
