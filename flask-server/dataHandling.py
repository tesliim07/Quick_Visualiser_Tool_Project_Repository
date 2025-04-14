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



def get_column_properties():
    # global uploaded_files 
    column_summaries = {}
    if len(uploaded_files) == 0:
        return 'No file uploaded'
    
    for each_file in uploaded_files:
        app.logger.info('file: ' + each_file)
        table_name = os.path.splitext(os.path.basename(each_file))[0]
        with open(each_file, "rb") as file:
            result = chardet.detect(file.read(5000))
            encoding_result = result.get('encoding')
        df_iter = pd.read_csv(each_file, encoding=encoding_result, chunksize=10000)
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
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
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
    return fields_properties_list

def process_file_for_remove_nulls(fileName, file_path, columnName):
    global modified_files
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    df = df.dropna(subset=[columnName])
    modifiedFilepath = f"{modified_folder}/modified_{fileName}.csv"
    app.logger.info(f'Process Remove Nulls, Saving modified file: {modifiedFilepath}')
    df.to_csv(modifiedFilepath, index=False)
    modified_files.add(modifiedFilepath)
    return f'Null values removed successfully and saved to {modifiedFilepath}'

def process_file_for_preview(file_path):
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    df = df.fillna("-").head(15)
    for column in df.select_dtypes(include=['number']).columns:
        df[column] = df[column].map(lambda x: f"{x:,}")
    return df.to_dict(orient='records')

def process_file_for_number_of_rows_retrieval(file_path):
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
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
    


# def ignoreIndexColumns(df):
#     index_columns = []
#     for column in df.columns:
#         if df[column].is_unique:
#             index_columns.append(column)
#     #add code for ignoring index columns when creating visualisations
#     return index_columns


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
    