from flask import Flask, request, jsonify
from flask_wtf import FlaskForm
from wtforms import FileField, SubmitField
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
from wtforms.validators import InputRequired
import pandas as pd
import chardet
from dataCleaning import ignoreIndexColumns, changeColumnDataTypes, getColumnSummary, save_csv

app = Flask(__name__)
CORS(app) #Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = '../static/uploadedFiles'

# Global variable to store the uploaded file
uploaded_file_path= None

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
    filename = os.path.basename(uploaded_file_path)
    return filename, 200

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

@app.route('/getUserConfigs', methods=['GET'])
def getUserConfigs():
    global uploaded_file_path
    if uploaded_file_path is None:
        return 'No file uploaded', 400
    
    user_configs = request.args
    try:
        with open(uploaded_file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
            df = pd.read_csv(uploaded_file_path, encoding=encoding_result)
            if user_configs.get('removeDuplicates') == "yes": 
                df.drop_duplicates(inplace=True)
            if user_configs.get('removeRowsWithNullValues') == "yes":
                df.dropna(inplace=True)
            if user_configs.get('ignoreIndexColumns') == "yes":
                ignoreIndexColumns(df)
            # if user_configs.get('detectBadDataPercentagePerColumn') == "yes":
            #     detectBadDataPercentagePerColumn(df)
            if user_configs.get('changeColumnDataTypes') == "yes":
                changeColumnDataTypes(user_configs.get('changeDataTypes'),df)
            preview = df.head(20)
            return preview.to_json(orient='split'), 200
        
        
    except Exception as e:
        return f'An error occurred while processing the file: {str(e)}', 500
    

if __name__ == '__main__':
    app.run(debug=True)
    
