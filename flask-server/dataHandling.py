import pandas as pd
from werkzeug.utils import secure_filename
from flask import Flask, jsonify
import os
import chardet
import logging

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploadedFiles'
# Global variable to store the uploaded file
uploaded_file_path= None
uploaded_files = []

logging.basicConfig(level=logging.INFO)  # Ensures INFO logs are shown
app.logger.setLevel(logging.INFO)

def get_uploaded_files(files):
    global uploaded_files
    uploaded_files = []
    for file in files:
        if file.filename == '':
            continue
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        uploaded_files.append(filepath)
    return uploaded_files
    
def get_file_names():
    global uploaded_files
    filenames = []
    if len(uploaded_files) == 0:
        return 'No file uploaded', 400
    for file in uploaded_files:
        filename = os.path.basename(file).split('.')[0]
        lowercase_filename = filename.lower()
        filenames.append(lowercase_filename)
    return filenames

def get_column_properties():
    global uploaded_files 
    column_summaries = {}
    if len(uploaded_files) == 0:
        return 'No file uploaded'
    
    for each_file in uploaded_files:
        app.logger.info('file: ' + each_file)
        table_name = os.path.splitext(os.path.basename(each_file))[0]
        with open(each_file, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
            
        df = pd.read_csv(each_file, encoding=encoding_result)
        summary = [
            {
                "column": col,
                "data_type": str(df[col].dtype),
                "bad_data": f"{df[col].isna().mean() * 100:.2f}%"
            }
            for col in df.columns
        ]
        
        column_summaries[table_name] = summary
        app.logger.info('column_summaries: ' + str(column_summaries))
        
    return column_summaries
    
    
    
def read_csv(filepath, encoding_result):
    df = pd.read_csv(filepath, encoding=encoding_result)
    return df


def ignoreIndexColumns(df):
    index_columns = []
    for column in df.columns:
        if df[column].is_unique:
            index_columns.append(column)
    #add code for ignoring index columns when creating visualisations
    return index_columns

# def getColumnSummary(df):
#     column_data_types = df.dtypes
#     column_summary = []
    
#     for column in df.columns:  
#         if column_data_types[column] in ['int64', 'float64']:
#             # For numeric columns, consider NaN values as bad data
#             bad_data_percentage = (df[column].isna().sum() / len(df)) * 100
#         elif column_data_types[column] == 'bool':
#          # For boolean columns, consider any value other than 0 and 1 as bad data
#             bad_data_percentage = ((df[column] != 0) & (df[column] != 1)).sum() / len(df) * 100
#         else:
#             # For other data types, consider NaN values as bad data
#             bad_data_percentage = (df[column].isna().sum() / len(df)) * 100
        
#         formatted_string = f"{column} {column_data_types[column]}: {bad_data_percentage:.2f}%"
#         column_summary.append(formatted_string)
        
#     return column_summary

def changeColumnDataTypes(change_dataTypes, df):
    try:
        for column, dtype in change_dataTypes.items():
            if column in df.columns:
                df[column] = df[column].astype(dtype)
                print(f"Changed column '{column}' to type '{dtype}'")
            else:
                print(f"Column '{column}' not found in DataFrame")

        return df  # Return the modified DataFrame
    except Exception as e:
        print(f"Error changing column data types: {str(e)}")
        return df  # Return original DataFrame if an error occurs
    