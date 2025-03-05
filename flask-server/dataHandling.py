import pandas as pd
from werkzeug.utils import secure_filename
from flask import Flask, jsonify
import os
import chardet
import logging



app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploadedFiles'
app.config['MODIFIED_FOLDER'] = './modifiedFiles'
modified_folder = app.config['MODIFIED_FOLDER']
# Global variable to store the uploaded file
uploaded_files = []
modified_uploaded_file = None

logging.basicConfig(level=logging.INFO)  # Ensures INFO logs are shown
app.logger.setLevel(logging.INFO)



def get_uploaded_files(files):
    global uploaded_files
    uploaded_files = []
    for file in files:
        if file.filename == '':
            continue
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename.lower())
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
    
def get_fields_properties(fileName):
    global uploaded_files
    global modified_uploaded_file
    
    if fileName not in str(modified_uploaded_file) or modified_uploaded_file is None:
        for file in os.listdir(modified_folder):
            file_path = os.path.join(modified_folder, file)  # Get full file path
            if os.path.isfile(file_path):  # Ensure it's a file, not a directory
                os.remove(file_path)
                app.logger.info('Removed file: ' + file)
        fields_properties_list = []
        for each_file in uploaded_files:
            app.logger.info(each_file)
            if fileName == os.path.basename(each_file).split('.')[0].lower():
                with open(each_file, "rb") as file:
                    result = chardet.detect(file.read())
                    encoding_result = result.get('encoding')
                df = pd.read_csv(each_file, encoding=encoding_result)
                for column in df.columns:
                    field_property = [column, str(df[column].dtype), str(df[column].isna().any()), f'{df[column].isna().mean() * 100:.2f} %']
                    fields_properties_list.append(field_property)
                modified_uploaded_file = each_file
                return fields_properties_list
        return 'File not uploaded yet'
            
    else:
        with open(modified_uploaded_file, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
        df = pd.read_csv(modified_uploaded_file, encoding=encoding_result)
        fields_properties_list = []
        for column in df.columns:
            field_property = [column, str(df[column].dtype), str(df[column].isna().any()), f'{df[column].isna().mean() * 100:.2f} %']
            fields_properties_list.append(field_property)
        return fields_properties_list

def remove_nulls_in_column(fileName, columnName):
    global modified_uploaded_file
    global uploaded_files
    
    if f'./modifiedFiles/modified_{fileName}.csv' != modified_uploaded_file:
        for each_file in uploaded_files:
            if fileName == os.path.basename(each_file).split('.')[0].lower():
                with open(each_file, "rb") as file:
                    result = chardet.detect(file.read())
                    encoding_result = result.get('encoding')
                df = pd.read_csv(each_file, encoding=encoding_result)
                if columnName in df.columns:
                    df = df.dropna(subset=[columnName])
                    app.logger.info(f'File: {app.config["MODIFIED_FOLDER"]}')
                    modifiedFilepath = os.path.join(app.config['MODIFIED_FOLDER'],f'modified_{fileName}.csv')
                    df.to_csv(modifiedFilepath, index=False)
                    modified_uploaded_file = modifiedFilepath
                    return f'Null values removed successfully and saved to {modifiedFilepath}'
                return 'Column not found'
    else:
        with open(modified_uploaded_file, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
            df = pd.read_csv(modified_uploaded_file, encoding=encoding_result)
            if columnName in df.columns:
                df = df.dropna(subset=[columnName])
                app.logger.info(f'File: {app.config["MODIFIED_FOLDER"]}')
                modifiedFilepath = os.path.join(app.config['MODIFIED_FOLDER'],f'modified_{fileName}.csv')
                df.to_csv(modifiedFilepath, index=False)
                modified_uploaded_file = modifiedFilepath
                return f'Null values removed successfully and saved to {modifiedFilepath}'
            return 'Column not found'
            
    return 'File not uploaded yet'


def get_preview(fileName):
    global uploaded_files
    global modified_uploaded_file
    if fileName not in str(modified_uploaded_file) or modified_uploaded_file is None:
        for each_file in uploaded_files:
            if fileName == os.path.basename(each_file).split('.')[0].lower():
                with open(each_file, "rb") as file:
                    result = chardet.detect(file.read())
                    encoding_result = result.get('encoding')
                df = pd.read_csv(each_file, encoding=encoding_result)
                modified_uploaded_file = each_file
                return df.fillna("NaN").head(15).to_dict(orient='records')
        return 'File not uploaded yet'
    else:
        with open(modified_uploaded_file, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
        df = pd.read_csv(modified_uploaded_file, encoding=encoding_result)
        return df.fillna("NaN").head(15).to_dict(orient='records')

    
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
    