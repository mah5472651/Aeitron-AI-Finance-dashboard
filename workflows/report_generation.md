# Report Generation Workflow

## Objective
Generate a comprehensive PDF financial report summarizing all dashboard metrics.

## Required Inputs
- Full dashboard report JSON (same format as the "Full Report (JSON)" download)
- Contains: `clients`, `expenses`, `invoices`, `leads`, `summary`

## Tools
- `tools/generate_report.py` — PDF report generator

## Steps
1. Export the full report JSON from the dashboard (Report > Full Report)
2. Run the report generator:
   ```bash
   python tools/generate_report.py aeitron-report-2026-04-08.json
   ```
3. PDF is saved to `.tmp/reports/`

## Report Contents
- **Financial Summary**: Revenue, expenses, net profit, outstanding dues, pipeline value
- **Expense Breakdown**: Category-wise expense table
- **Client Overview**: Top 20 clients with project values and payments
- **Overdue Invoices**: List of all overdue invoices with amounts
- **Lead Pipeline**: Stage-wise lead count summary

## Expected Output
- PDF file at `.tmp/reports/financial_report_<timestamp>.pdf`
- JSON response: `{ "success": true, "path": "..." }`

## Edge Cases
- Reports with 0 clients/invoices still generate valid PDFs
- Client table is capped at 20 rows to prevent overflow
- Requires `fpdf2` dependency
