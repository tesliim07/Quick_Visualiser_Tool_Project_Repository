<h1>Quick Visualiser Tool</h1>

A lightweight, web-based application for non-technical users to quickly upload, explore, clean, and visualise unfamiliar tabular datasets.

<h2> Project Overview </h2>
Many data analysts and domain experts struggle to familiarise themselves with new datasets without writing code or learning complex BI tools. The Quick Visualiser Tool addresses this by:
<li>Uploading common formats (CSV)</li>  
<li>Extracting metadata (column types, null/“bad” data percentages, row counts, file size)  </li>
<li>Cleaning with one-click operations (remove nulls, eliminate duplicates)</li> 
<li>Visualising dynamically (histograms, correlation heatmaps, bar charts, box plots) </li>
<li>No coding required—everything happens via user interface </li> 

<h2>Features</h2>
<li>Multi-file upload with size handling up to 20 MB </li>
<li>Automatic profiling: column structure, data-type detection, bad-data summary</li>
<li>Interactive cleaning: remove nulls, drop duplicates, preview changes</li> 
<li>Dynamic visualisations: zoomable, hover-enabled charts</li>  
<li>Local dataset storage: preserves original files and cleaning configurations</li>  

<h2>Tech Stack</h2>
<li>Frontend: React + TypeScript</li>  
<li>Backend: Flask (Python)</li>  
<li>Database: Local JSON storage (no external DB required) </li>
<li>Visualisation: Plotly (HTML-based interactive charts)  </li>
<li>Containerisation: Docker </li>
<h2>Installation</h2>
<ol>
  <h3>Manual Setup</h3>
  <li>Clone the repo:
    git clone https://github.com/tesliim07/Quick_Visualiser_Tool_Project_Repository.git</li>
  <li>pip install -r flask-server/requirements.txt</li>
  <ol>
    <h4>Backend</h4>
    <li>cd quick-visualiser-tool/flask-server</li>
    <li>python -m flask --app server run</li>
  </ol>
  <ol>
    <h4>Frontend</h4>
    <li>cd ../quick-visualiser-tool</li>
    <li>npm install</li>
    <li>npm start</li>
    <li>npm run dev</li>
  </ol>
</ol>

<h2>Usage</h2>
<li>Upload one or more CSV/JSON files on the Upload page.</li>
<li>Inspect the automatically generated column summary (data types, null percentages).</li>
<li>Clean with one-click operations (remove nulls, drop duplicates), preview changes.
<li>Explore visualisations by hovering on visualisation button or click the button to see full visualisations (visualisations include histograms, correlation heatmaps, bar/box plots).
<li>Configurations are automatically saved, with option to revert back to the original dataset(s) uploaded</li>

<h2>Contact</h2>
<li>Teslim Hassan - oluwatobiteslimhassan@gmail.com</li>
<li>GitHib: @tesliim07</li>
