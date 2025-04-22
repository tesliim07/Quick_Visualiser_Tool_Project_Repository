import plotly.express as px
import os
import plotly.express as px
import chardet
import pandas as pd
import logging
import shutil
from flask import Flask
from dataHandling import modified_files, uploaded_files

app = Flask(__name__)
histogram_dir = "static/histogramVisualisations"
bar_chart_dir = "static/barChartVisualisations"
correlation_dir = "static/correlationVisualisations"
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
    app.logger.info(f'Process File for Histogram : Numerical Columns: {numerical_columns}')
    for column_name in numerical_columns:
        app.logger.info(f'Process File for Histogram : Column Name: {column_name}')
        # Histogram for numerical variables
        fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
        app.logger.info(f'Process File for Histogram : Figure: {fig}')
        fig.update_layout(
            xaxis_title=column_name,
            yaxis_title="Frequency",
            title_x=0.5  # Center the title
        )
        app.logger.info(f'Process File for Histogram : Column Name2: {column_name}')
        app.logger.info(f'Process File for Histogram : Figure2: {fig}')
        html_file_path = os.path.join(subfolder_path, f"histogram_{column_name}.html")
        app.logger.info(f'Process File for Histogram : HTML File Path: {html_file_path}')
        fig.write_html(html_file_path)
        app.logger.info(f'Process File for Histogram : HTML File Path: {html_file_path}')
            
        html_list.append(f'/{html_file_path}')
    app.logger.info(f'Process File for Histogram : HTML List: {html_list}')
    return html_list


def process_file_for_bar_chart(file_path, subfolder_path):
    app.logger.info(f'Process File for Bar Chart : Using file for bar chart: {file_path}')
    app.logger.info(f'Process File for Bar Chart : Using existing subfolder for bar chart: {subfolder_path}')
    html_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    column_names = df.columns.to_list()
    app.logger.info(f'Process File for Bar Chart : Column Names: {column_names}')
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
        app.logger.info(f'Process File for Bar Chart : HTML File Path: {html_file_path}')
        fig_bar.write_html(html_file_path)
            
        html_list.append(f'/{html_file_path}')
    app.logger.info(f'Process File for Bar Chart : HTML List: {html_list}')
    return html_list

def process_file_for_box_plots(file_path, subfolder_path):
    app.logger.info(f'Process File for Box Plots : Using file for box plot: {file_path}')
    app.logger.info(f'Process File for Box Plots : Using existing subfolder for box plot: {subfolder_path}')
    html_list = []
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df_iter = pd.read_csv(file_path, encoding=encoding_result, chunksize=10000)
    df = pd.concat(df_iter, ignore_index=True)
    numeric_columns = df.select_dtypes(include=['number']).columns.to_list()
    app.logger.info(f'Process File for Box Plots : Numeric Columns: {numeric_columns}')

    for column_name in numeric_columns:
        fig_box = px.box(df, y=column_name, title=f"Box Plot of {column_name}")
        fig_box.update_layout(
            yaxis_title=column_name,
            title_x=0.5
        )
        html_file_path = os.path.join(subfolder_path, f"box_plot_{column_name}.html")
        fig_box.write_html(html_file_path)
        app.logger.info(f'Process File for Box Plots : HTML File Path: {html_file_path}')
        html_list.append(f'/{html_file_path}')
    app.logger.info(f'Process File for Box Plots : HTML List: {html_list}')

    return html_list

def process_file_for_correlation(file_path, subfolder_path):
    app.logger.info(f'Process File for Correlation : Using file for correlation: {file_path}')
    app.logger.info(f'Process File for Correlation : Using existing subfolder for correlation: {subfolder_path}')
    with open(file_path, "rb") as file:
        result = chardet.detect(file.read(5000))
        encoding_result = result.get('encoding')
    df = pd.read_csv(file_path, encoding=encoding_result)
    numerical_df = df.select_dtypes(include=['number'])
    app.logger.info(f'Process File for Correlation : Numerical Columns: {numerical_df.columns}')
    correlation_matrix = numerical_df.corr()
    fig_corr = px.imshow(
        correlation_matrix,
        text_auto=True,
        title='Correlation Heatmap (r)',
        color_continuous_scale='RdBu_r',
        aspect='auto'
    )
    fig_corr_square = px.imshow(
        correlation_matrix**2,
        text_auto=True,
        title='Correlation Heatmap (r²)',
        color_continuous_scale='RdBu_r',
        aspect='auto'
    )

        
    html_file_path = os.path.join(subfolder_path, "correlation_heatmap_r.html")
    html_file_path_square = os.path.join(subfolder_path, "correlation_heatmap_r².html")
    fig_corr.write_html(html_file_path)
    fig_corr_square.write_html(html_file_path_square)
    app.logger.info(f'Process File for Correlation : HTML File Path: {html_file_path}')
    app.logger.info(f'Process File for Correlation : HTML File Path Square: {html_file_path_square}')
 
    return [f'/{html_file_path}', f'/{html_file_path_square}']
       

def generate_histogram_urls(fileName):
    file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    subfolder_path = os.path.join(histogram_dir, f'histogramVisualisations_{fileName}')
    if os.path.exists(subfolder_path):
        app.logger.info(f'Histogram, Using modified file for histogram: {file_path}')
        app.logger.info(f'Histogram, Using existing subfolder for histogram: {subfolder_path}')
        app.logger.info(f'Histogram, Modified Files: {modified_files}')
        
        try:
            shutil.rmtree(subfolder_path)  # Remove the existing subfolder
            app.logger.info(f'Histogram, Removed existing subfolder: {subfolder_path}')
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path}: {str(e)}")
        
    os.makedirs(subfolder_path)
    
    if file_path in modified_files:
        app.logger.info(f'Using modified file for histogram: {file_path}')
        return process_file_for_histogram(file_path, subfolder_path)
    
    file_path = f'./uploadedFiles/{fileName}.csv'
    if file_path in uploaded_files:
        app.logger.info(f'No modified file found, searching in uploaded files... for histogram')
        app.logger.info(f'Using uploaded file for histogram: {file_path}')
        return process_file_for_histogram(file_path, subfolder_path)
    
    return 'File not uploaded yet'

def generate_bar_chart_urls(fileName):
    file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    subfolder_path = os.path.join(bar_chart_dir, f'barChartVisualisations_{fileName}')
    if os.path.exists(subfolder_path):
        app.logger.info(f'Bar Chart, Using modified file for bar chart: {file_path}')
        app.logger.info(f'Bar Chart, Using existing subfolder for bar chart: {subfolder_path}')
        app.logger.info(f'Bar Chart, Modified Files: {modified_files}')
        
        try:
            shutil.rmtree(subfolder_path)  # Remove the existing subfolder
            app.logger.info(f'Bar Chart, Removed existing subfolder: {subfolder_path}')
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path}: {str(e)}")
        
    os.makedirs(subfolder_path)
    
    if file_path in modified_files:
        app.logger.info(f'Using modified file for bar chart: {file_path}')
        return process_file_for_bar_chart(file_path, subfolder_path)
    
    file_path = f'./uploadedFiles/{fileName}.csv'
    if file_path in uploaded_files:
        app.logger.info(f'No modified file found, searching in uploaded files... for bar chart')
        app.logger.info(f'Using uploaded file for bar chart: {file_path}')
        return process_file_for_bar_chart(file_path, subfolder_path)
    
    return 'File not uploaded yet'


def generate_box_plot_urls(fileName):
    file_path = os.path.join(modified_folder, f'modified_{fileName}.csv')
    subfolder_path = os.path.join(box_plots_dir, f'boxPlotVisualisations_{fileName}')
    if os.path.exists(subfolder_path):
        app.logger.info(f'Box Plot, Using modified file for box plot: {file_path}')
        app.logger.info(f'Box Plot, Using existing subfolder for box plot: {subfolder_path}')
        app.logger.info(f'Box Plot, Modified Files: {modified_files}')
        
        try:
            shutil.rmtree(subfolder_path)  # Remove the existing subfolder
            app.logger.info(f'Box Plot, Removed existing subfolder: {subfolder_path}')
        except Exception as e:
            app.logger.error(f"Error removing subfolder {subfolder_path}: {str(e)}")
            
    os.makedirs(subfolder_path)
    
    if file_path in modified_files:
        app.logger.info(f'Using modified file for box plot: {file_path}')
        return process_file_for_box_plots(file_path, subfolder_path)
    
    file_path = f'./uploadedFiles/{fileName}.csv'
    if file_path in uploaded_files:
        app.logger.info(f'No modified file found, searching in uploaded files... for box plot')
        app.logger.info(f'Using uploaded file for box plot: {file_path}')
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






# # def generate_correlation_heatmap_url(df):
# #     numerical_df = df.select_dtypes(include=['number'])
# #     # Create Correlation Heatmap (r)
# #     fig_corr = px.imshow(
# #         numerical_df.corr(),
# #         text_auto=True,
# #         title='Correlation Heatmap (r)',
# #         color_continuous_scale='RdBu_r',
# #         aspect='auto'
# #     )
# #     fig_corr.update_layout(title_text="Correlation Heatmap(r)")
    
# #     html_file_path = os.path.join(html_dir, "correlation_heatmap_r.html")
# #     fig_corr.write_html(html_file_path)

    
# #     return f"/static/Visualisations/correlation_heatmap_r.html"
    
# # def generate_correlation_heatmap_squared_url(df):
# #     numerical_df = df.select_dtypes(include=['number'])
# #     correlation_matrix = numerical_df.corr()
# #     correlation_matrix = correlation_matrix ** 2

# #     # Create Correlation Heatmap (r²)
# #     fig_corr = px.imshow(
# #         correlation_matrix,
# #         text_auto=True,
# #         title='Correlation Heatmap (r²)',
# #         color_continuous_scale='RdBu_r',
# #         aspect='auto'
# #     )
# #     fig_corr.update_layout(title_text="Correlation Heatmap(r²)")
    
# #     html_file_path = os.path.join(html_dir, "correlation_heatmap_r².html")
# #     fig_corr.write_html(html_file_path)
    
# #     return f"/static/Visualisations/correlation_heatmap_r².html"

# def generate_box_plot_url(df):
#     numeric_df = df.select_dtypes(include=['number'])
    
#     # Melt the DataFrame to have one column for "Variable" and another for "Value"
#     df_melted = numeric_df.melt(var_name="Variable", value_name="Value")
    
#     # Box plot for numerical variables
#     fig_box = px.box(
#         df_melted,
#         x="Variable",
#         y="Value",
#         title=f'Box Plot of All Variables',
#         color="Variable", # Different colors for each variable
#     )
    
#     fig_box.update_layout(
#         xaxis_title="Variables",
#         yaxis_title="Values",
#         xaxis_tickangle=-45  # Rotate labels for better readability
#     )
#     html_file_path = os.path.join(html_dir,"box_plot.html")
#     fig_box.write_html(html_file_path)
    
#     return f"/static/Visualisations/box_plot.html"

# # def generate_histogram_urls(df):
# #     html_list = []
# #     numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
# #     for column_name in numerical_columns:
# #         # Histogram for numerical variables
# #         fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
# #         fig.update_layout(
# #             xaxis_title=column_name,
# #             yaxis_title="Frequency",
# #             title_x=0.5  # Center the title
# #         )
    
# #         html_file_path = os.path.join(html_dir, f"histogram_{column_name}.html")
# #         fig.write_html(html_file_path)
        
# #         html_url = f"/static/Visualisations/histogram_{column_name}.html"
# #         html_list.append(html_url)
    
# #     return html_list

# def generate_bar_plots_urls(df):
#     html_list = []
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
        
#         html_file_path = os.path.join(html_dir, f"bar_plot_{column_name}.html")
#         fig.write_html(html_file_path)
        
#         html_url = f"/static/Visualisations/bar_plot_{column_name}.html"
#         html_list.append(html_url)
    
#     return html_list


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



















