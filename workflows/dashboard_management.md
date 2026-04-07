# Dashboard Management Workflow

## Objective
Run, maintain, and extend the Aeitron Finance Dashboard.

## Required Inputs
- Node.js (v18+) installed on the system
- `dashboard/` directory with all dependencies installed

## Starting the Dashboard

1. Navigate to the dashboard directory: `cd dashboard`
2. Install dependencies (if first time): `npm install`
3. Start the dev server: `npm run dev`
4. Open the URL shown in terminal (default: http://localhost:5173)

## Building for Production

1. Run `npm run build` from `dashboard/`
2. Output goes to `dashboard/dist/`
3. Serve with any static file server

## Data Management

- All data is stored in browser LocalStorage (`aeitron_clients`, `aeitron_expenses`, `aeitron_leads`, etc.)
- Data persists across browser refreshes but is browser-specific
- To export: use the **Report** dropdown in the topbar (supports JSON and CSV)
- To clear all data: run `localStorage.clear()` in browser console

## Available Tools

Python tools in `tools/` for automation and data processing:

| Tool | Purpose | Workflow |
|------|---------|----------|
| `export_data.py` | Export to CSV/PDF | `workflows/data_export.md` |
| `generate_report.py` | PDF financial report | `workflows/report_generation.md` |
| `send_email.py` | Send emails via SMTP | `workflows/email_notifications.md` |
| `email_templates.py` | Email template library | (used by send_email.py) |
| `sync_google_sheets.py` | Google Sheets sync | `workflows/google_sheets_sync.md` |
| `utils.py` | Shared utilities | (used by all tools) |

Install dependencies: `pip install -r tools/requirements.txt`

## Adding New Features

- Components live in `dashboard/src/components/` organized by feature (layout, cards, clients, charts)
- State is managed via 10 context providers in `dashboard/src/context/`
- Derived metrics are computed in `dashboard/src/utils/calculations.js`
- Add new fields to the client model in `ClientForm.jsx` and update the reducer in `ClientContext.jsx`

## Edge Cases

- If localStorage is corrupted, the app falls back to an empty client array
- Charts show placeholder UI when there's insufficient data (< 2 months for revenue chart)
- Form validates that amount paid cannot exceed total project value
