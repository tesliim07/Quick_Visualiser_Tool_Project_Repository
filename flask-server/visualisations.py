import plotly.express as px
import os
import plotly.express as px
import chardet
import pandas as pd
import numpy as np
import logging
import shutil
from flask import Flask
from dataHandling import modified_files, uploaded_files

app = Flask(__name__)
histogram_dir = "static/histogramVisualisations"
bar_chart_dir = "static/barChartVisualisations"
correlation_dir = "static/correlationVisualisations"
bar_chart_img_dir = "static/barChartImages"
histogram_img_dir = "static/histogramImages"
box_plots_img_dir = "static/boxPlotImages"
box_plots_dir = "static/boxPlotVisualisations"
modified_folder = "./modifiedFiles"
uploaded_folder = "./uploadedFiles"

logging.basicConfig(level=logging.INFO)  # Ensures INFO logs are shown
app.logger.setLevel(logging.INFO)

def process_file_for_histogram(file_path, subfolder_path):
    app.logger.info(f'Process File for Histogram : Using file for histogram: {file_path}')
    app.logger.info(f'Process File for Histogram : Using existing subfolder for histogram: {subfolder_path}')
    html_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
    for column_name in numerical_columns:
        # Histogram for numerical variables
        fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
        fig.update_layout(
            xaxis_title=column_name,
            yaxis_title="Frequency",
            title_x=0.5  # Center the title
        )
        html_file_path = os.path.join(subfolder_path, f"histogram_{column_name}.html")
        fig.write_html(html_file_path)
            
        html_list.append(f'/{html_file_path}')
    return html_list


def process_file_for_bar_chart(file_path, subfolder_path):
    html_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    column_names = df.columns.to_list()
    for column_name in column_names:
        # Check if the column is categorical or boolean
        if df[column_name].dtype == 'object' or df[column_name].dtype == 'bool':
            counts_df = df[column_name].value_counts().reset_index()
            counts_df.columns = [column_name, "Count"]
            fig_bar = px.bar(
                # df[column_name].value_counts().reset_index(),
                counts_df,
                x=column_name,
                y="Count",
                title=f"Bar Chart of {column_name} (Category Count)",
                labels={"column_name": column_name, "Count": "Count"},
            )
              
        # For numerical columns
        elif df[column_name].dtype in ['int64', 'float64']:
            counts_df = df[column_name].value_counts().reset_index()
            counts_df.columns = [column_name, "Frequency"]
            fig_bar = px.bar(
                # df[column_name].value_counts().reset_index(),
                counts_df,
                x=column_name,
                y="Frequency",
                title=f"Bar Chart of {column_name} (Numerical Value Counts)",
                labels={column_name: column_name, "Frequency": "Frequency"},
            )  
                 
        html_file_path = os.path.join(subfolder_path, f"bar_chart_{column_name}.html")
        fig_bar.write_html(html_file_path)
            
        html_list.append(f'/{html_file_path}')
    return html_list

def process_file_for_box_plots(file_path, subfolder_path):
    html_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    numeric_columns = df.select_dtypes(include=['number']).columns.to_list()

    for column_name in numeric_columns:
        fig_box = px.box(df, y=column_name, title=f"Box Plot of {column_name}")
        fig_box.update_layout(
            yaxis_title=column_name,
            title_x=0.5
        )
        html_file_path = os.path.join(subfolder_path, f"box_plot_{column_name}.html")
        fig_box.write_html(html_file_path)
        html_list.append(f'/{html_file_path}')

    return html_list

def process_file_for_correlation(file_path, subfolder_path):
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df = pd.read_csv(file_path, encoding=encoding_result)
    numerical_df = df.select_dtypes(include=['number'])
    correlation_matrix = numerical_df.corr()
    fig_corr = px.imshow(
        correlation_matrix,
        text_auto=True,
        title='Correlation Heatmap (r)',
        color_continuous_scale='Blues',
        aspect='auto'
    )
    fig_corr_square = px.imshow(
        correlation_matrix**2,
        text_auto=True,
        title='Correlation Heatmap (r²)',
        color_continuous_scale='Blues',
        aspect='auto'
    )
        
    html_file_path = os.path.join(subfolder_path, "correlation_heatmap_r.html")
    html_file_path_square = os.path.join(subfolder_path, "correlation_heatmap_r².html")
    fig_corr.write_html(html_file_path)
    fig_corr_square.write_html(html_file_path_square)
 
    return [f'/{html_file_path}', f'/{html_file_path_square}']
       

def generate_histogram(fileName,decider):
    file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    subfolder_path = os.path.join(histogram_dir, f'histogramVisualisations_{fileName}')
    subfolder_path_img = os.path.join(histogram_img_dir, f'histogramImages_{fileName}')
    if decider == 'urls' and os.path.exists(subfolder_path):       
        try:
            shutil.rmtree(subfolder_path)  # Remove the existing subfolder
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path}: {str(e)}")
        
    if decider== 'imgs' and os.path.exists(subfolder_path_img):      
        try:
            shutil.rmtree(subfolder_path_img)  # Remove the existing subfolder
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path_img}: {str(e)}")
        
    os.makedirs(subfolder_path, exist_ok=True)
    os.makedirs(subfolder_path_img, exist_ok=True)
    
    if file_path in modified_files:
        if decider == 'imgs':
            return process_file_for_histogram_images(file_path, subfolder_path_img)
        return process_file_for_histogram(file_path, subfolder_path)
    
    file_path = f'./uploadedFiles/{fileName}.csv'
    if file_path in uploaded_files:
        if decider == 'imgs':
            return process_file_for_histogram_images(file_path, subfolder_path_img)
        return process_file_for_histogram(file_path, subfolder_path)
    
    return 'File not uploaded yet'

def generate_bar_chart(fileName,decider):
    file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    subfolder_path = os.path.join(bar_chart_dir, f'barChartVisualisations_{fileName}')
    subfolder_path_img = os.path.join(bar_chart_img_dir, f'barChartImages_{fileName}')
    if decider == 'urls' and os.path.exists(subfolder_path):  
        try:
            shutil.rmtree(subfolder_path)  # Remove the existing subfolder
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path}: {str(e)}")
                      
    if decider == 'imgs' and os.path.exists(subfolder_path_img):   
        try:
            shutil.rmtree(subfolder_path_img)  # Remove the existing subfolder
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path_img}: {str(e)}")
      
    os.makedirs(subfolder_path, exist_ok=True) 
    os.makedirs(subfolder_path_img, exist_ok=True)
    
    if file_path in modified_files:
        if decider == 'imgs':
            return process_file_for_bar_chart_images(file_path, subfolder_path_img)
        return process_file_for_bar_chart(file_path, subfolder_path)
    
    file_path = f'./uploadedFiles/{fileName}.csv'
    if file_path in uploaded_files:
        if decider == 'imgs':
            return process_file_for_bar_chart_images(file_path, subfolder_path_img)
        return process_file_for_bar_chart(file_path, subfolder_path)
    
    return 'File not uploaded yet'


def generate_box_plot(fileName,decider):
    file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    subfolder_path = os.path.join(box_plots_dir, f'boxPlotVisualisations_{fileName}')
    subfolder_path_img = os.path.join(box_plots_img_dir, f'boxPlotImages_{fileName}')
    if decider == 'urls' and os.path.exists(subfolder_path):
        try:
            shutil.rmtree(subfolder_path)  # Remove the existing subfolder
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path}: {str(e)}")
            
            
    if decider == 'imgs' and os.path.exists(subfolder_path_img):
        try:
            shutil.rmtree(subfolder_path_img)  # Remove the existing subfolder
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path_img}: {str(e)}")
      
    os.makedirs(subfolder_path, exist_ok=True)      
    os.makedirs(subfolder_path_img, exist_ok=True)
    
    if file_path in modified_files:
        app.logger.info(f'Using modified file for box plot: {file_path}')
        if decider == 'imgs':
            return process_file_for_box_plots_images(file_path, subfolder_path_img)
        return process_file_for_box_plots(file_path, subfolder_path)
    
    file_path = f'./uploadedFiles/{fileName}.csv'
    if file_path in uploaded_files:
        if decider == 'imgs':
            return process_file_for_box_plots_images(file_path, subfolder_path_img)
        return process_file_for_box_plots(file_path, subfolder_path)
    
    return 'File not uploaded yet'


def generate_correlation_urls(fileName):
    modified_file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    uploaded_file_path = os.path.join(uploaded_folder, f'{fileName}.csv')
    subfolder_path = os.path.join(correlation_dir, f'correlationVisualisations_{fileName}')
    if not os.path.exists(subfolder_path):
        os.makedirs(subfolder_path)
    if modified_file_path in modified_files:
        app.logger.info(f'Using modified file for correlation: {modified_file_path}')
        return process_file_for_correlation(modified_file_path, subfolder_path)
    if uploaded_file_path in uploaded_files:
        app.logger.info(f'No modified file found, searching in uploaded files... for correlation')
        return process_file_for_correlation(uploaded_file_path, subfolder_path) 
    return 'File not uploaded yet'
        


def process_file_for_histogram_images(file_path, subfolder_path):
    img_str_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
    for column_name in numerical_columns:
        # Histogram for numerical variables
        fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
        fig.update_layout(
            xaxis_title=column_name,
            yaxis_title="Frequency",
            title_x=0.5  # Center the title
        )
        img_file_path = os.path.join(subfolder_path, f"histogram_{column_name}.png")
        fig.write_image(img_file_path, format="png")
        img_str_list.append({'column': column_name,'img_file_path': img_file_path})
        
    return img_str_list


def process_file_for_bar_chart_images(file_path, subfolder_path):
    img_str_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    column_names = df.columns.to_list()
    for column_name in column_names:
        # Check if the column is categorical or boolean
        if df[column_name].dtype == 'object' or df[column_name].dtype == 'bool':
            counts_df = df[column_name].value_counts().reset_index()
            counts_df.columns = [column_name, "Count"]
            fig = px.bar(
                counts_df,
                x=column_name,
                y="Count",
                title=f"Bar Plot of {column_name} (Category Count)",
                labels={"column_name": column_name, "Count": "Count"},
            )
            
        # For numerical columns
        elif df[column_name].dtype in ['int64', 'float64']:
            counts_df = df[column_name].value_counts().reset_index()
            counts_df.columns = [column_name, "Frequency"]
            fig = px.bar(
                counts_df,
                x=column_name,
                y="Frequency",
                title=f"Bar Plot of {column_name} (Numerical Value Counts)",
                labels={column_name: column_name, "Frequency": "Frequency"},
            )
        
        img_file_path = os.path.join(subfolder_path, f"bar_chart_{column_name}.png")
        fig.write_image(img_file_path, format="png")
        img_str_list.append({'column': column_name,'img_file_path': img_file_path})
    
    return img_str_list


def process_file_for_box_plots_images(file_path, subfolder_path):
    img_str_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    numeric_columns = df.select_dtypes(include=['number']).columns.to_list()
    for column_name in numeric_columns:
        fig_box = px.box(df, y=column_name, title=f"Box Plot of {column_name}")
        fig_box.update_layout(
            yaxis_title=column_name,
            title_x=0.5
        )
        img_file_path = os.path.join(subfolder_path, f"box_plot_{column_name}.png")
        fig_box.write_image(img_file_path, format="png")
        img_str_list.append({'column': column_name,'img_file_path': img_file_path})
        
        # # Convert image to base64
        # with open(img_file_path, "rb") as image_file:
        #     img_str = base64.b64encode(image_file.read()).decode("utf-8")
        # img_str_list.append(img_str)   

    return img_str_list









# def generate_correlation_heatmap_squared(df):
#     numerical_df = df.select_dtypes(include=['number'])
#     correlation_matrix = numerical_df.corr()
#     correlation_matrix = correlation_matrix ** 2

#     # Create Correlation Heatmap (r²)
#     fig_corr = px.imshow(
#         correlation_matrix,
#         text_auto=True,
#         title='Correlation Heatmap (r²)',
#         color_continuous_scale='RdBu_r',
#         aspect='auto'
#     )
#     fig_corr.update_layout(title_text="Correlation Heatmap(r²)")
    
#     # Save plot to buffer
#     buffer = BytesIO()
#     fig_corr.write_image(buffer, format="png")
#     buffer.seek(0)

#     # Convert image to base64
#     img_str = base64.b64encode(buffer.read()).decode("utf-8")
    
#     return img_str

# def generate_box_plot(df):
#     numeric_df = df.select_dtypes(include=['number'])
    
#     # Melt the DataFrame to have one column for "Variable" and another for "Value"
#     df_melted = numeric_df.melt(var_name="Variable", value_name="Value")
    
#     # Box plot for numerical variables
#     fig_box = px.box(
#         df_melted,
#         x="Variable",
#         y="Value",
#         title=f'Bar Plot of All Variables',
#         color="Variable", # Different colors for each variable
#     )
    
#     fig_box.update_layout(
#         xaxis_title="Variables",
#         yaxis_title="Values",
#         xaxis_tickangle=-45  # Rotate labels for better readability
#     )
    
#     # Save plot to buffer
#     buffer = BytesIO()
#     fig_box.write_image(buffer, format="png")
#     buffer.seek(0)
    
#     # Convert image to base64
#     img_str = base64.b64encode(buffer.read()).decode("utf-8")
    
#     return img_str

# def generate_histogram(df):
#     img_str_list = []
#     numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
#     for column_name in numerical_columns:
#         # Histogram for numerical variables
#         fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
#         fig.update_layout(
#             xaxis_title=column_name,
#             yaxis_title="Frequency",
#             title_x=0.5  # Center the title
#         )
    
#         # Save plot to buffer
#         buffer = BytesIO()
#         fig.write_image(buffer, format="png")
#         buffer.seek(0)
        
#         # Convert image to base64
#         img_str = base64.b64encode(buffer.read()).decode("utf-8")
#         img_str_list.append(img_str)
    
#     return img_str_list

# def generate_bar_plots(df):
#     img_str_list = []
#     column_names = df.columns.to_list()
#     for column_name in column_names:
#         # Check if the column is categorical or boolean
#         if df[column_name].dtype == 'object' or df[column_name].dtype == 'bool':
#             counts_df = df[column_name].value_counts().reset_index()
#             counts_df.columns = [column_name, "Count"]
#             fig = px.bar(
#                 # df[column_name].value_counts().reset_index(),
#                 counts_df,
#                 x=column_name,
#                 y="Count",
#                 title=f"Bar Plot of {column_name} (Category Count)",
#                 labels={"column_name": column_name, "Count": "Count"},
#             )
            
#         # For numerical columns
#         elif df[column_name].dtype in ['int64', 'float64']:
#             counts_df = df[column_name].value_counts().reset_index()
#             counts_df.columns = [column_name, "Frequency"]
#             fig = px.bar(
#                 # df[column_name].value_counts().reset_index(),
#                 counts_df,
#                 x=column_name,
#                 y="Frequency",
#                 title=f"Bar Plot of {column_name} (Numerical Value Counts)",
#                 labels={column_name: column_name, "Frequency": "Frequency"},
#             )
        
#         # Save the plot to a buffer
#         buffer = BytesIO()
#         fig.write_image(buffer, format="png")
#         buffer.seek(0)
        
#         img_str = base64.b64encode(buffer.read()).decode("utf-8")
#         img_str_list.append(img_str) 
    
#     return img_str_list


# def generate_time_plots(df, time_columns):
#     img_str_list = []
#     column_names = df.columns.to_list()
#     for time_column in time_columns:
#         # For each time column, plot against every other column (that is not a time column)
#         for column_name in column_names:
#             if column_name != time_column:  # Skip plotting time column against itself
#                 # Check if the column is numerical or categorical to decide the type of plot
#                 if df[column_name].dtype in ['int64', 'float64']:
#                     fig = px.scatter(
#                         df, x=time_column, y=column_name,
#                         title=f"Scatter Plot: {column_name} vs {time_column}",
#                         labels={time_column: "Time", column_name: "Value"},
#                     )
#                 elif df[column_name].dtype in ['object', 'bool']:
#                     fig = px.box(
#                         df, x=time_column, y=column_name,
#                         title=f"Box Plot: {column_name} vs {time_column}",
#                         labels={time_column: "Time", column_name: "Category"},
#                     )
                
#                 if fig:
#                     buffer = BytesIO()
#                     fig.write_image(buffer, format="png")
#                     buffer.seek(0)
                    
#                     img_str = base64.b64encode(buffer.read()).decode("utf-8")
#                     img_str_list.append(img_str)
                
#     return img_str_list








# def generate_time_plots_urls(df, time_columns):
#     html_list = []
#     column_names = df.columns.to_list()
#     for time_column in time_columns:
#         # For each time column, plot against every other column (that is not a time column)
#         for column_name in column_names:
#             if column_name != time_column:  # Skip plotting time column against itself
#                 # Check if the column is numerical or categorical to decide the type of plot
#                 if df[column_name].dtype in ['int64', 'float64']:
#                     fig = px.scatter(
#                         df, x=time_column, y=column_name,
#                         title=f"Scatter Plot: {column_name} vs {time_column}",
#                         labels={time_column: "Time", column_name: "Value"},
#                     )
#                 elif df[column_name].dtype in ['object', 'bool']:
#                     fig = px.box(
#                         df, x=time_column, y=column_name,
#                         title=f"Box Plot: {column_name} vs {time_column}",
#                         labels={time_column: "Time", column_name: "Category"},
#                     )
                
#                 if fig:
#                     html_file_path = os.path.join(html_dir, f"time_plot_{column_name}.html")
#                     fig.write_html(html_file_path)
        
#                     html_url = f"/static/Visualisations/time_plot_{column_name}.html"
#                     html_list.append(html_url)
                
#     return html_list



















