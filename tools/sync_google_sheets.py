"""Sync dashboard data to/from Google Sheets.

Usage:
    echo '{"action": "push", "sheet_id": "...", "tab": "clients", "data": [...]}' | python tools/sync_google_sheets.py

Requirements:
    - credentials.json (Google service account) in project root
    - Sheet must be shared with the service account email

Input JSON:
    action: "push" | "pull"
    sheet_id: Google Sheets ID
    tab: "clients" | "expenses" | "invoices" | "leads"
    data: array of records (for push only)

Output JSON:
    success: bool
    records: int (number of records synced)
    data: array (for pull only)
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from utils import read_json_input, write_json_output, PROJECT_ROOT

# Column headers per tab
TAB_HEADERS = {
    "clients": ["clientName", "companyName", "serviceType", "onboardingStatus", "paymentCategory", "totalProjectValue", "amountPaid", "milestones"],
    "expenses": ["description", "category", "amount", "date", "recurring"],
    "invoices": ["invoiceNumber", "clientName", "companyName", "status", "issueDate", "dueDate", "total"],
    "leads": ["name", "company", "email", "stage", "dealValue"],
}


def get_gspread_client():
    """Authenticate and return a gspread client."""
    import gspread
    from google.oauth2.service_account import Credentials

    creds_path = PROJECT_ROOT / "credentials.json"
    if not creds_path.exists():
        raise FileNotFoundError(
            f"credentials.json not found at {creds_path}. "
            "Download a Google service account key and place it in the project root."
        )

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    creds = Credentials.from_service_account_file(str(creds_path), scopes=scopes)
    return gspread.authorize(creds)


def push_data(sheet_id, tab, records):
    """Push data to a Google Sheet tab."""
    gc = get_gspread_client()
    spreadsheet = gc.open_by_key(sheet_id)

    headers = TAB_HEADERS.get(tab)
    if not headers:
        raise ValueError(f"Unknown tab: {tab}. Options: {list(TAB_HEADERS.keys())}")

    # Get or create worksheet
    try:
        worksheet = spreadsheet.worksheet(tab.title())
    except Exception:
        worksheet = spreadsheet.add_worksheet(title=tab.title(), rows=len(records) + 1, cols=len(headers))

    # Clear and write
    worksheet.clear()
    rows = [headers]
    for record in records:
        row = [record.get(h, "") for h in headers]
        # Convert non-string values
        row = [str(v) if not isinstance(v, (int, float, bool)) else v for v in row]
        rows.append(row)

    worksheet.update(rows, value_input_option="USER_ENTERED")
    return len(records)


def pull_data(sheet_id, tab):
    """Pull data from a Google Sheet tab."""
    gc = get_gspread_client()
    spreadsheet = gc.open_by_key(sheet_id)

    try:
        worksheet = spreadsheet.worksheet(tab.title())
    except Exception:
        raise ValueError(f"Worksheet '{tab.title()}' not found in spreadsheet")

    all_values = worksheet.get_all_values()
    if len(all_values) < 2:
        return []

    headers = all_values[0]
    records = []
    for row in all_values[1:]:
        record = {}
        for i, header in enumerate(headers):
            val = row[i] if i < len(row) else ""
            # Try to convert numeric values
            try:
                val = float(val)
                if val == int(val):
                    val = int(val)
            except (ValueError, TypeError):
                pass
            record[header] = val
        records.append(record)

    return records


def main():
    try:
        data = read_json_input()
        action = data.get("action", "push")
        sheet_id = data.get("sheet_id")
        tab = data.get("tab", "clients")

        if not sheet_id:
            raise ValueError("Missing 'sheet_id'")

        if action == "push":
            records = data.get("data", [])
            count = push_data(sheet_id, tab, records)
            write_json_output({"success": True, "records": count, "action": "push"})

        elif action == "pull":
            records = pull_data(sheet_id, tab)
            write_json_output({"success": True, "records": len(records), "data": records, "action": "pull"})

        else:
            raise ValueError(f"Unknown action: {action}. Use 'push' or 'pull'.")

    except Exception as e:
        write_json_output({"success": False, "error": str(e)})
        sys.exit(1)


if __name__ == "__main__":
    main()
