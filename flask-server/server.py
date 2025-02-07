from flask import Flask, request, jsonify
from flask_wtf import FlaskForm
from wtforms import FileField, SubmitField
from werkzeug.utils import secure_filename
from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
import os
from wtforms.validators import InputRequired
import pandas as pd
import chardet
from dataCleaning import ignoreIndexColumns, changeColumnDataTypes, getColumnSummary
from schemaGenerator import generate_create_table_sql
import psycopg2
from sqlalchemy import create_engine, text
import logging


app = Flask(__name__)
CORS(app) #Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = './uploadedFiles'

engine = create_engine('postgresql://QuickVisualiserToolUser:securepostgres@postgres:5432/QuickVisualiserToolDatabase')
# Database configuration
# DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://QuickVisualiserToolUser:securepostgres@postgres:5432/QuickVisualiserToolDatabase')
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
# db = SQLAlchemy(app)

# Global variable to store the uploaded file
uploaded_file_path= None

logging.basicConfig(level=logging.INFO)  # Ensures INFO logs are shown
app.logger.setLevel(logging.INFO)


class UploadFileForm(FlaskForm):
    file = FileField('File', validators=[InputRequired()])
    submit = SubmitField('Upload File')


@app.route('/upload', methods=['POST'])
def upload():
    global uploaded_file_path
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        uploaded_file_path = file_path
        print(uploaded_file_path)
        # return 'File has been uploaded successfully', 200
        return uploaded_file_path, 200
    
@app.route('/getFileName', methods=['GET'])
def getFileName():
    global uploaded_file_path
    if uploaded_file_path is None:
        return 'No file uploaded', 400
    filename = os.path.basename(uploaded_file_path).split('.')[0]
    lowercase_filename = filename.lower()
    return lowercase_filename, 200

@app.route('/getColumnDataTypes', methods=['GET'])
def getColumnDataTypes():
    global uploaded_file_path
    if uploaded_file_path is None:
        return 'No file uploaded', 400
    # Extract the column data types
    try:
        with open(uploaded_file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
        
        df = pd.read_csv(uploaded_file_path, encoding=encoding_result)
        column_data_types = df.dtypes.to_string()
        print(column_data_types)
        return column_data_types, 200
    except Exception as e:
        return f'An error occurred while processing the file: {str(e)}', 500

@app.route('/getColumnNames', methods=['GET'])
def getColumnNames():
    global uploaded_file_path
    if uploaded_file_path is None:
        return 'No file uploaded', 400
    # Extract the column data types
    try:
        with open(uploaded_file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
        
        df = pd.read_csv(uploaded_file_path, encoding=encoding_result)
        column_names = df.columns.to_list()
        print(column_names)
        return column_names, 200
    except Exception as e:
        return f'An error occurred while processing the file: {str(e)}', 500

@app.route('/getColumnDataTypesWithTheirBadDataPercentage', methods=['GET'])
def getColumnDataTypesWithTheirBadDataPercentage():
    global uploaded_file_path
    if uploaded_file_path is None:
        return 'No file uploaded', 400
    
    try:
        with open(uploaded_file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
        
        df = pd.read_csv(uploaded_file_path, encoding=encoding_result)
        column_summary = getColumnSummary(df)
        return column_summary, 200
    except Exception as e:
        return f'An error occurred while processing the file: {str(e)}', 500

@app.route('/userConfigs', methods=['POST'])
def userConfigs():
    global uploaded_file_path
    if uploaded_file_path is None:
        return 'No file uploaded', 400
    
    user_configs = request.json
    if not user_configs:
        return jsonify({'error': 'No configurations provided'}), 400
    try:
        with open(uploaded_file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
            df = pd.read_csv(uploaded_file_path, encoding=encoding_result)
            cleaned_df = df
            if user_configs.get('removeDuplicates') == "yes": 
                cleaned_df=cleaned_df.drop_duplicates()
            if user_configs.get('removeRowsWithNullValues') == "yes":
                cleaned_df=cleaned_df.dropna()
            if user_configs.get('ignoreIndexColumns') == "yes":
                ignoreIndexColumns(cleaned_df)
            # if user_configs.get('detectBadDataPercentagePerColumn') == "yes":
            #     detectBadDataPercentagePerColumn(df)
            if user_configs.get('changeColumnDataTypes') == "yes":
                change_dataTypes = user_configs.get('changeDataTypes',{})
                cleaned_df=changeColumnDataTypes(change_dataTypes,cleaned_df)
            preview = cleaned_df.head(20)
            return preview.to_json(orient='split'), 200
        
        
    except Exception as e:
        return f'An error occurred while getting the preview of the modified file: {str(e)}', 500

@app.route('/saveCleanedFile', methods=['POST'])
def saveCleanedFile():
    global uploaded_file_path
    if uploaded_file_path is None:
        return 'No file uploaded', 400
    user_configs = request.json
    if not user_configs:
        return jsonify({'error': 'No configurations provided'}), 400
    try:
        with open(uploaded_file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
            df = pd.read_csv(uploaded_file_path, encoding=encoding_result)
            cleaned_df = df
            if user_configs.get('removeDuplicates') == "yes": 
                app.logger.info("remove duplicate")
                cleaned_df = cleaned_df.drop_duplicates()
            if user_configs.get('removeRowsWithNullValues') == "yes":
                app.logger.info("remove rows with null values")
                cleaned_df = cleaned_df.dropna()
            if user_configs.get('ignoreIndexColumns') == "yes":
                ignoreIndexColumns(cleaned_df)
            if user_configs.get('changeColumnDataTypes') == "yes":
                change_dataTypes = user_configs.get('changeDataTypes',{})
                app.logger.info(f'Change column data types: {change_dataTypes}')
                cleaned_df=changeColumnDataTypes(change_dataTypes,cleaned_df)
            table_name = os.path.basename(uploaded_file_path).split('.')[0]
            lowercase_table_name = table_name.lower()
            create_table_sql = generate_create_table_sql(cleaned_df, lowercase_table_name)
            
            # Log the generated SQL statement
            app.logger.info(f'Generated SQL: {create_table_sql}')
            
            # Save the cleaned file to the database
            with engine.connect() as conn:
                app.logger.info(f"Dropping table: {lowercase_table_name}")
                conn.execute(text(f"DROP TABLE IF EXISTS {lowercase_table_name}"))
                conn.commit()
                
                app.logger.info(f"Creating table with SQL: {create_table_sql}")
                conn.execute(text(create_table_sql))
                conn.commit()
                
            cleaned_df.to_sql(lowercase_table_name, engine, if_exists="append", index=False)
                
            return f'{lowercase_table_name} has been cleaned and saved successfully to the database', 200
            
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return f'An error occurred while saving the file: {str(e)}', 500   

@app.route('/getTableNamesFromDatabase', methods=['GET'])
def getTableNamesFromDatabase():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"))
            table_names = [row[0] for row in result]
            app.logger.info(f'Table names: {table_names}')
            return jsonify(table_names), 200
    except Exception as e:
        return f'An error occurred while fetching the table names: {str(e)}', 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    
