# Google Sheets Sync Workflow

## Objective
Sync dashboard data bidirectionally with Google Sheets for external access and collaboration.

## Required Inputs
- Google Sheets spreadsheet ID
- Tab name: `clients`, `expenses`, `invoices`, or `leads`
- Action: `push` (upload) or `pull` (download)
- Data array (for push only)

## Prerequisites
1. Create a Google Cloud project and enable the Sheets API
2. Create a service account and download `credentials.json`
3. Place `credentials.json` in the project root (gitignored)
4. Share the target Google Sheet with the service account email

## Tools
- `tools/sync_google_sheets.py` — Push/pull data to/from Google Sheets

## Steps

### Push Data to Sheets
1. Export data from the dashboard (JSON report or individual data type)
2. Run:
   ```bash
   echo '{"action": "push", "sheet_id": "YOUR_SHEET_ID", "tab": "clients", "data": [...]}' | python tools/sync_google_sheets.py
   ```
3. Data is written to the specified tab (created if it doesn't exist)
4. Existing data in the tab is overwritten

### Pull Data from Sheets
1. Run:
   ```bash
   echo '{"action": "pull", "sheet_id": "YOUR_SHEET_ID", "tab": "clients"}' | python tools/sync_google_sheets.py
   ```
2. Returns JSON array of records from the sheet
3. Numeric values are auto-converted from strings

## Tab Structure
Each tab uses these column headers:
- **Clients**: clientName, companyName, serviceType, onboardingStatus, paymentCategory, totalProjectValue, amountPaid, milestones
- **Expenses**: description, category, amount, date, recurring
- **Invoices**: invoiceNumber, clientName, companyName, status, issueDate, dueDate, total
- **Leads**: name, company, email, stage, dealValue

## Edge Cases
- Missing `credentials.json` returns a clear error with setup instructions
- Sheet must be shared with the service account — otherwise returns a permission error
- Push overwrites all existing data in the tab (no merge/append)
- Pull from an empty or missing tab returns an empty array
- Requires `gspread` and `google-auth` dependencies
