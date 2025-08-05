# Quick Visualiser Tool Project

## Overview

Quick Visualiser Tool is a web-based application designed to help users upload, clean, and visualize tabular datasets (such as CSV files). It provides a user-friendly interface for data upload, cleaning operations (like removing nulls and duplicates, changing column data types), and generates interactive visualizations including histograms, bar charts, box plots, and correlation heatmaps. The backend is built with Flask and uses a PostgreSQL database for storing cleaned datasets, while the frontend is built with React.

---

## Features

- **Upload Datasets:** Drag-and-drop or select files to upload.
- **View Datasets:** See all uploaded datasets and their metadata.
- **Data Cleaning:** Remove duplicates, handle nulls, change column data types, and preview changes.
- **Visualisations:** Generate and view histograms, bar charts, box plots, and correlation heatmaps for your data.
- **Database Integration:** Save cleaned datasets to a PostgreSQL database.
- **Dataset Management:** Remove datasets, revert to original files, and manage your data easily.

---

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js & npm
- PostgreSQL (with a database and user created for the app)

### Backend (Flask)

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Configure database:**
   - Update the connection string in `server.py` if needed:
     ```
     postgresql://QuickVisualiserToolUser:securepostgres@postgres:5432/QuickVisualiserToolDatabase
     ```
3. **Run the Flask server:**
   ```bash
   python flask-server/server.py
   ```
   The server will start on port `5000`.

### Frontend (React)

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```
2. **Start the React app:**
   ```bash
   npm run dev
   ```
   The app will run on port `5174` by default.

---

## Usage

1. **Upload Files:** Go to the Upload Page, drag-and-drop or select your CSV files, and click "Upload".
2. **View Datasets:** Navigate to the View Datasets Page to see all uploaded files and their info.
3. **Clean Data:** Use the User Configuration Interface to select cleaning options and preview changes.
4. **Visualise Data:** Generate visualisations for your datasets and explore the results.
5. **Manage Datasets:** Remove files, revert changes, or save cleaned data to the database.

---

## API Endpoints

Some key backend endpoints include:

- `POST /uploadFiles` — Upload one or more files.
- `GET /getFileNames` — Get a list of uploaded file names.
- `GET /getFileInfos` — Get metadata for uploaded files.
- `GET /getColumnProperties` — Get column properties for selected files.
- `GET /getFieldsProperties/<fileName>` — Get detailed field properties for a file.
- `POST /removeNulls` — Remove nulls from a column.
- `POST /removeDuplicates` — Remove duplicate rows.
- `GET /getHistogram/<fileName>` — Get histogram visualisations.
- `GET /getBarChart/<fileName>` — Get bar chart visualisations.
- `GET /getBoxPlot/<fileName>` — Get box plot visualisations.
- `GET /getCorrelationUrls/<fileName>` — Get correlation heatmap visualisations.
- `DELETE /removeFile/<fileName>` — Remove a file from the system.

---

## Project Structure

```
Quick Visualiser Tool Project/
├── flask-server/
│   ├── server.py
│   ├── visualisations.py
│   ├── dataHandling.py
│   └── ...
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Upload.tsx
│   │   │   ├── ViewDatasets.tsx
│   │   │   ├── UserConfigurationInterface.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ModifiedCSVPreviewDisplay.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── README.md
```

---

## Notes

- Make sure your PostgreSQL server is running and accessible.
- The backend and frontend communicate via REST API; ensure CORS is enabled (already set in `server.py`).
- For development, run both the Flask server and React app simultaneously.

---

## License

This project is for educational and research
