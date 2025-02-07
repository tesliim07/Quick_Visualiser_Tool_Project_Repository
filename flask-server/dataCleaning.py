import pandas as pd
from werkzeug.utils import secure_filename
from flask import Flask

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = './uploadedFiles'


def read_csv(filepath, encoding_result):
    df = pd.read_csv(filepath, encoding=encoding_result)
    return df

# def save_csv(df, filepath):
#     # Extract the filename and extension from the filepath
#     filename, file_extension = os.path.splitext(os.path.basename(filepath))
    
#     # Save the cleaned file with the same filename
#     new_file = df.to_csv(f"cleaned_{filename}{file_extension}", index=False)
#     # filename = secure_filename(new_file.filename)
#     file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#     new_file.save(file_path)
#     uploaded_file_path = file_path
#     print(uploaded_file_path)
#     # return 'File has been uploaded successfully', 200
#     return uploaded_file_path


def ignoreIndexColumns(df):
    index_columns = []
    for column in df.columns:
        if df[column].is_unique:
            index_columns.append(column)
    #add code for ignoring index columns when creating visualisations
    return index_columns

def getColumnSummary(df):
    column_data_types = df.dtypes
    column_summary = []
    
    for column in df.columns:  
        if column_data_types[column] in ['int64', 'float64']:
            # For numeric columns, consider NaN values as bad data
            bad_data_percentage = (df[column].isna().sum() / len(df)) * 100
        elif column_data_types[column] == 'bool':
         # For boolean columns, consider any value other than 0 and 1 as bad data
            bad_data_percentage = ((df[column] != 0) & (df[column] != 1)).sum() / len(df) * 100
        else:
            # For other data types, consider NaN values as bad data
            bad_data_percentage = (df[column].isna().sum() / len(df)) * 100
        
        formatted_string = f"{column} {column_data_types[column]}: {bad_data_percentage:.2f}%"
        column_summary.append(formatted_string)
        
    return column_summary

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
    