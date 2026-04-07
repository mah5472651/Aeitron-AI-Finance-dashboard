# Data Export Workflow

## Objective
Export dashboard data (clients, expenses, invoices, leads) to CSV or PDF format.

## Required Inputs
- **Data type**: `clients`, `expenses`, `invoices`, `leads`, or `team`
- **Format**: `csv` or `pdf`
- **Data**: JSON array of records (from dashboard report or LocalStorage)

## Tools
- `tools/export_data.py` — Server-side CSV/PDF export
- `dashboard/src/utils/exportCsv.js` — Client-side CSV export (browser)

## Steps

### Option A: Client-Side (Browser)
1. User clicks **Report** button in the dashboard topbar
2. Selects the data type from the dropdown (Clients, Expenses, etc.)
3. CSV file is generated and downloaded automatically via `exportCsv.js`

### Option B: Server-Side (Python)
1. Get the data as JSON (export from dashboard or provide directly)
2. Run the export tool:
   ```bash
   echo '{"type": "clients", "format": "csv", "data": [...]}' | python tools/export_data.py
   ```
3. Output file is saved to `.tmp/exports/`

## Expected Output
- CSV: Comma-separated file with headers matching the data type
- PDF: Formatted table with Aeitron branding

## Edge Cases
- Empty data array produces a file with headers only
- PDF export requires `fpdf2` dependency (`pip install fpdf2`)
- Long text values are truncated to 30 characters in PDF cells
