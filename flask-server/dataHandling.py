import pandas as pd
from werkzeug.utils import secure_filename
from flask import Flask, jsonify
import os
import chardet
import logging
from datetime import datetime



app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploadedFiles'
app.config['MODIFIED_FOLDER'] = './modifiedFiles'
modified_folder = app.config['MODIFIED_FOLDER']
uploaded_folder = app.config['UPLOAD_FOLDER']
# Global variable to store the uploaded file
uploaded_files = []
modified_files= set()
uploaded_file = None
modified_uploaded_file = None
uploaded_times = []

logging.basicConfig(level=logging.INFO)  # Ensures INFO logs are shown
app.logger.setLevel(logging.INFO)



def get_uploaded_files(files):
    global uploaded_files
    global uploaded_times
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['MODIFIED_FOLDER'], exist_ok=True)
    
    for file in files:
        if file.filename == '':
            continue
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename.lower())
        file.save(filepath)
        upload_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        app.logger.info('Upload Time: ' + upload_time)
        if filepath not in uploaded_files:
            uploaded_files.append(filepath)
            uploaded_times.append(f'{filepath};{upload_time}')
    app.logger.info('uploaded_times: ' + str(uploaded_times))
    return uploaded_files
    
def get_file_names():
    filenames = []
    if len(uploaded_files) == 0:
        return []
    app.logger.info('uploaded_files: ' + str(uploaded_files))
    for file in uploaded_files:
        filename = os.path.basename(file).split('.')[0]
        lowercase_filename = filename.lower()
        filenames.append(lowercase_filename)
    return filenames

def get_file_infos():
    fileinfos = []
    filename_upload_time = ''
    
    file_names = get_file_names()
    for file_name in file_names:
        uploaded_time = next((time for time in uploaded_times if file_name in time), None)
        app.logger.info(f'Uploaded Time: {uploaded_time}')
        if uploaded_time != None:
            filename_upload_time = uploaded_time.split(';')[1]
            app.logger.info(f'{file_name} filename_upload_time: ' + filename_upload_time)
        
        lowercase_filename = file_name
        fileinfos.append(f'{lowercase_filename}; {filename_upload_time}')
    return fileinfos



def get_column_properties(file_paths):
    column_summaries = {}
    
    for each_file_path in file_paths:
        app.logger.info('filepath: ' + each_file_path)
        table_name = os.path.splitext(os.path.basename(each_file_path))[0]
        with open(each_file_path, "rb") as file:
            result = chardet.detect(file.read(5000))
            encoding_result = result.get('encoding')
        df_iter = pd.read_csv(each_file_path, encoding=encoding_result, chunksize=10000)
        df = pd.concat(df_iter, ignore_index=True)
        summary = []
        dtypes = df.dtypes.astype(str).replace({'object': 'string', 'int64': 'integer', 'float64': 'float'}) 
        summary = [
            {
                "column": col,
                "data_type": dtypes[col],
                "bad_data": f"{df[col].isna().mean() * 100:.2f}%"
            }
            for col in df.columns
        ]
        
        column_summaries[table_name] = summary
        app.logger.info('column_summaries: ' + str(column_summaries))
        
    return column_summaries


def process_file_for_fields_properties(file_path):
    app.logger.info(f'Process File for Fields Properties, file_path: {file_path}')
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    app.logger.info(f'Process File for Fields Properties, encoding_result: {encoding_result}')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    app.logger.info(f'Process File for Fields Properties, df: {df}')
    dtypes = df.dtypes.astype(str).replace({'object': 'string', 'int64': 'integer', 'float64': 'float'}) 
    is_na_any = df.isna().any()
    na_percentage = df.isna().mean() * 100
    fields_properties_list = [
        [
            column,
            dtypes[column],
            str(is_na_any[column]),
            f"{na_percentage[column]:.2f} %"
        ]
        for column in df.columns
    ]
    app.logger.info(f'Process File for Fields Properties, fields_properties_list: {fields_properties_list}')
    return fields_properties_list

def process_file_for_remove_nulls(fileName, file_path, columnName):
    global modified_files
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    df = df.dropna(subset=[columnName])
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    app.logger.info(f'Process Remove Nulls, Saving modified file: {modified_file_path}')
    df.to_csv(modified_file_path, index=False)
    modified_files.add(modified_file_path)
    return f'Null values removed successfully and saved to {modified_file_path}'

def process_file_for_has_duplicates(file_path):
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    if df.duplicated().any():
        return 'True'
    else:
        return 'False'


def process_file_for_remove_duplicates(fileName, file_path):
    global modified_files
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    df = df.drop_duplicates(keep='last')
    df = df.reset_index(drop=True)
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    app.logger.info(f'Process Remove Duplicates, Saving modified file: {modified_file_path}')
    df.to_csv(modified_file_path, index=False)
    modified_files.add(modified_file_path)
    return f'Duplicates removed successfully and saved to {modified_file_path}'

def process_file_for_preview(file_path):
    app.logger.info(f'Process File for Preview, file_path: {file_path}')
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    df = df.fillna("-").head(15)
    for column in df.select_dtypes(include=['number']).columns:
        df[column] = df[column].map(lambda x: f"{x:,}")
    app.logger.info(f'Process File for Preview, df: {df}')
    return df.to_dict(orient='records')

def process_file_for_number_of_rows_retrieval(file_path):
    app.logger.info(f'Process File for Number of Rows, file_path: {file_path}')
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    app.logger.info(f'Process File for Number of Rows, df: {df}')
    return f"{len(df):,}"
    
def get_fields_properties(fileName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    uploaded_file_path = os.path.join(uploaded_folder, f'{fileName}.csv')    
    app.logger.info(f'Fields Properties, modified_files: {str(modified_files)}')
    app.logger.info(f'Fields Properties, modified_file_path: {modified_file_path}')
    if modified_file_path in modified_files:
        app.logger.info(f'Fields Properties, Using modified file: {modified_file_path}')
        return process_file_for_fields_properties(modified_file_path)
    app.logger.info(f'Fields Properties, No modified file found, searching in uploaded files...')
    if uploaded_file_path in uploaded_files:
        return process_file_for_fields_properties(uploaded_file_path)
    return 'File not uploaded yet'

def get_number_of_rows(fileName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    uploaded_file_path = os.path.join(uploaded_folder, f'{fileName}.csv')
    if modified_file_path in modified_files:
        app.logger.info(f'Get Number of Rows, Using modified file: {modified_file_path}')
        return process_file_for_number_of_rows_retrieval(modified_file_path)
    app.logger.info(f'Get Number of Rows, No modified file found, searching in uploaded files...')
    if uploaded_file_path in uploaded_files:
        return process_file_for_number_of_rows_retrieval(uploaded_file_path)
    return 'File not uploaded yet'


def remove_nulls_in_column(fileName, columnName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    uploaded_file_path = os.path.join(uploaded_folder, f'{fileName}.csv')
    if modified_file_path in modified_files:
        app.logger.info(f'Remove Nulls , Using modified file: {modified_file_path}')
        return process_file_for_remove_nulls(fileName,modified_file_path, columnName)
    app.logger.info(f'Remove Nulls, No modified file found, searching in uploaded files...')
    if uploaded_file_path in uploaded_files:
        return process_file_for_remove_nulls(fileName, uploaded_file_path, columnName) 
    return 'File not uploaded yet'

def remove_duplicates(fileName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    uploaded_file_path = os.path.join(uploaded_folder, f'{fileName}.csv')
    if modified_file_path in modified_files:
        app.logger.info(f'Remove Duplicates, Using modified file: {modified_file_path}')
        return process_file_for_remove_duplicates(fileName,modified_file_path)
    app.logger.info(f'Remove Duplicates, No modified file found, searching in uploaded files...')
    if uploaded_file_path in uploaded_files:
        return process_file_for_remove_duplicates(fileName, uploaded_file_path) 
    return 'File not uploaded yet' 

def has_duplicates(fileName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    uploaded_file_path = os.path.join(uploaded_folder, f'{fileName}.csv')
    if modified_file_path in modified_files:
        app.logger.info(f'Get Duplicates, Using modified file: {modified_file_path}')
        return process_file_for_has_duplicates(modified_file_path)
    app.logger.info(f'Get Duplicates, No modified file found, searching in uploaded files...')
    if uploaded_file_path in uploaded_files:
        return process_file_for_has_duplicates(uploaded_file_path) 
    return 'File not uploaded yet'

     
def get_preview(fileName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    uploaded_file_path = os.path.join(uploaded_folder, f'{fileName}.csv')
    if modified_file_path in modified_files:
        app.logger.info(f'Preview, Using modified file: {modified_file_path}')
        return process_file_for_preview(modified_file_path)
    app.logger.info(f'Preview, No modified file found, searching in uploaded files...')
    if uploaded_file_path in uploaded_files:
        return process_file_for_preview(uploaded_file_path)
    return 'File not uploaded yet'
    
def delete_modified_dataset(fileName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    if os.path.exists(modified_file_path):
        os.remove(modified_file_path)
        modified_files.remove(modified_file_path)
        app.logger.info('Removed file: ' + modified_file_path)
        return 'Deleted successfully'
    return 'File not found'
      
     
def delete_file_from_list(fileName):
    global uploaded_files
    file_path = f'./uploadedFiles/{fileName}.csv'
    if file_path in uploaded_files:
        uploaded_files.remove(file_path)
        os.remove(file_path)
        return 'File removed successfully'
    else:
        return 'File not found'    
    



# def changeColumnDataTypes(change_dataTypes, df):
#     try:
#         for column, dtype in change_dataTypes.items():
#             if column in df.columns:
#                 df[column] = df[column].astype(dtype)
#                 print(f"Changed column '{column}' to type '{dtype}'")
#             else:
#                 print(f"Column '{column}' not found in DataFrame")

#         return df  # Return the modified DataFrame
#     except Exception as e:
#         print(f"Error changing column data types: {str(e)}")
#         return df  # Return original DataFrame if an error occurs
    
    
    
    
    
    
    
