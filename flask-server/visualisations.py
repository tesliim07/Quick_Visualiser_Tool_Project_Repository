import plotly.express as px
import plotly.io as pio
import os
import plotly.express as px
import base64
from io import BytesIO
import chardet
import pandas as pd
import logging
from flask import Flask

app = Flask(__name__)
html_dir = "static/Visualisations"
histogram_dir = "static/histogramVisualisations"
correlation_dir = "static/correlationVisualisations"
modified_files_path = "./modifiedFiles"

def generate_histogram_urls(fileName):
    file_path = os.path.join(modified_files_path, f'./modified_{fileName}.csv')
    if not os.path.exists(file_path):
        for file in os.listdir(histogram_dir):
            file_path = os.path.join(histogram_dir, file)  # Get full file path
            if os.path.isfile(file_path):  # Ensure it's a file, not a directory
                os.remove(file_path)
                app.logger.info('Removed file: ' + file)
        html_list = []
        file_path = f'./uploadedFiles/{fileName}.csv'
        if os.path.exists(file_path):    
            with open(file_path, "rb") as file:
                result = chardet.detect(file.read())
                encoding_result = result.get('encoding')
                df = pd.read_csv(file_path, encoding=encoding_result)
                numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
                for column_name in numerical_columns:
                    # Histogram for numerical variables
                    fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
                    fig.update_layout(
                        xaxis_title=column_name,
                        yaxis_title="Frequency",
                        title_x=0.5  # Center the title
                    )
                
                    html_file_path = os.path.join(histogram_dir, f"histogram_{column_name}.html")
                    fig.write_html(html_file_path)
                    app.logger.info(f'FilesURLpath: {html_file_path}')
                    
                    #html_url = f"/static/histogramVisualisations/histogram_{column_name}.html"
                    html_list.append(f'/{html_file_path}')
        else:
            return 'File not uploaded yet'       
    else:
        with open(file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
            df = pd.read_csv(file_path, encoding=encoding_result)
            html_list = []
            numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
            for column_name in numerical_columns:
                # Histogram for numerical variables
                fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
                fig.update_layout(
                    xaxis_title=column_name,
                    yaxis_title="Frequency",
                    title_x=0.5  # Center the title
                )
            
                html_file_path = os.path.join(histogram_dir, f"histogram_{column_name}.html")
                fig.write_html(html_file_path)
                
                #html_url = f"/static/histogramVisualisations/histogram_{column_name}.html"
                html_list.append(f'/{html_file_path}')
    
    return html_list


def generate_correlation_urls(fileName):
    file_path = os.path.join(modified_files_path, f'./modified_{fileName}.csv')
    if not os.path.exists(file_path):
        for file in os.listdir(correlation_dir):
            file_path = os.path.join(correlation_dir, file)  # Get full file path
            if os.path.isfile(file_path):  # Ensure it's a file, not a directory
                os.remove(file_path)
                app.logger.info('Removed file: ' + file)
        file_path = f'./uploadedFiles/{fileName}.csv'
        if os.path.exists(file_path):    
            with open(file_path, "rb") as file:
                result = chardet.detect(file.read())
                encoding_result = result.get('encoding')
                df = pd.read_csv(file_path, encoding=encoding_result)
                numerical_df = df.select_dtypes(include=['number'])
                correlation_matrix = numerical_df.corr()
                correlation_matrix = correlation_matrix ** 2
                
                fig_corr = px.imshow(
                     numerical_df.corr(),
                    text_auto=True,
                    title='Correlation Heatmap (r)',
                    color_continuous_scale='RdBu_r',
                    aspect='auto'
                )
                fig_corr_square = px.imshow(
                    correlation_matrix,
                    text_auto=True,
                    title='Correlation Heatmap (r²)',
                    color_continuous_scale='RdBu_r',
                    aspect='auto'
                )
  
                fig_corr.update_layout(title_text="Correlation Heatmap(r)")
                fig_corr_square.update_layout(title_text="Correlation Heatmap(r²)")
                
                html_file_path = os.path.join(correlation_dir, "correlation_heatmap_r.html")
                html_file_path_square = os.path.join(correlation_dir, "correlation_heatmap_r².html")
                fig_corr.write_html(html_file_path)
                fig_corr_square.write_html(html_file_path_square)
     
                return [f'/{html_file_path}', f'/{html_file_path_square}']
        else:
            return 'File not uploaded yet'       
    else:
        with open(file_path, "rb") as file:
            result = chardet.detect(file.read())
            encoding_result = result.get('encoding')
            df = pd.read_csv(file_path, encoding=encoding_result)
            numerical_df = df.select_dtypes(include=['number'])
            correlation_matrix = numerical_df.corr()
            correlation_matrix = correlation_matrix ** 2
            fig_corr = px.imshow(
                numerical_df.corr(),
                text_auto=True,
                title='Correlation Heatmap (r)',
                color_continuous_scale='RdBu_r',
                aspect='auto'
            )
            fig_corr_square = px.imshow(
                correlation_matrix,
                text_auto=True,
                title='Correlation Heatmap (r²)',
                color_continuous_scale='RdBu_r',
                aspect='auto'
            )
            
            fig_corr.update_layout(title_text="Correlation Heatmap(r)")
            fig_corr_square.update_layout(title_text="Correlation Heatmap(r²)")
                
            html_file_path = os.path.join(correlation_dir, "correlation_heatmap_r.html")
            html_file_path_square = os.path.join(correlation_dir, "correlation_heatmap_r².html")
            fig_corr.write_html(html_file_path)
            fig_corr_square.write_html(html_file_path_square)
                
            return [f'/{html_file_path}', f'/{html_file_path_square}']
        
        
        
        





def generate_correlation_heatmap(df):
    # Create heatmap
    numerical_df = df.select_dtypes(include=['number'])
    # Create Correlation Heatmap (r)
    fig_corr = px.imshow(
        numerical_df.corr(),
        text_auto=True,
        title='Correlation Heatmap (r)',
        color_continuous_scale='RdBu_r',
        aspect='auto'
    )
    fig_corr.update_layout(title_text="Correlation Heatmap(r)")
    
    # Save plot to buffer
    buffer = BytesIO()
    fig_corr.write_image(buffer, format="png")
    buffer.seek(0)

    # Convert image to base64
    img_str = base64.b64encode(buffer.read()).decode("utf-8")
    
    return img_str
    
def generate_correlation_heatmap_squared(df):
    numerical_df = df.select_dtypes(include=['number'])
    correlation_matrix = numerical_df.corr()
    correlation_matrix = correlation_matrix ** 2

    # Create Correlation Heatmap (r²)
    fig_corr = px.imshow(
        correlation_matrix,
        text_auto=True,
        title='Correlation Heatmap (r²)',
        color_continuous_scale='RdBu_r',
        aspect='auto'
    )
    fig_corr.update_layout(title_text="Correlation Heatmap(r²)")
    
    # Save plot to buffer
    buffer = BytesIO()
    fig_corr.write_image(buffer, format="png")
    buffer.seek(0)

    # Convert image to base64
    img_str = base64.b64encode(buffer.read()).decode("utf-8")
    
    return img_str

def generate_box_plot(df):
    numeric_df = df.select_dtypes(include=['number'])
    
    # Melt the DataFrame to have one column for "Variable" and another for "Value"
    df_melted = numeric_df.melt(var_name="Variable", value_name="Value")
    
    # Box plot for numerical variables
    fig_box = px.box(
        df_melted,
        x="Variable",
        y="Value",
        title=f'Bar Plot of All Variables',
        color="Variable", # Different colors for each variable
    )
    
    fig_box.update_layout(
        xaxis_title="Variables",
        yaxis_title="Values",
        xaxis_tickangle=-45  # Rotate labels for better readability
    )
    
    # Save plot to buffer
    buffer = BytesIO()
    fig_box.write_image(buffer, format="png")
    buffer.seek(0)
    
    # Convert image to base64
    img_str = base64.b64encode(buffer.read()).decode("utf-8")
    
    return img_str

def generate_histogram(df):
    img_str_list = []
    numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
    for column_name in numerical_columns:
        # Histogram for numerical variables
        fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
        fig.update_layout(
            xaxis_title=column_name,
            yaxis_title="Frequency",
            title_x=0.5  # Center the title
        )
    
        # Save plot to buffer
        buffer = BytesIO()
        fig.write_image(buffer, format="png")
        buffer.seek(0)
        
        # Convert image to base64
        img_str = base64.b64encode(buffer.read()).decode("utf-8")
        img_str_list.append(img_str)
    
    return img_str_list

def generate_bar_plots(df):
    img_str_list = []
    column_names = df.columns.to_list()
    for column_name in column_names:
        # Check if the column is categorical or boolean
        if df[column_name].dtype == 'object' or df[column_name].dtype == 'bool':
            counts_df = df[column_name].value_counts().reset_index()
            counts_df.columns = [column_name, "Count"]
            fig = px.bar(
                # df[column_name].value_counts().reset_index(),
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
                # df[column_name].value_counts().reset_index(),
                counts_df,
                x=column_name,
                y="Frequency",
                title=f"Bar Plot of {column_name} (Numerical Value Counts)",
                labels={column_name: column_name, "Frequency": "Frequency"},
            )
        
        # Save the plot to a buffer
        buffer = BytesIO()
        fig.write_image(buffer, format="png")
        buffer.seek(0)
        
        img_str = base64.b64encode(buffer.read()).decode("utf-8")
        img_str_list.append(img_str) 
    
    return img_str_list


def generate_time_plots(df, time_columns):
    img_str_list = []
    column_names = df.columns.to_list()
    for time_column in time_columns:
        # For each time column, plot against every other column (that is not a time column)
        for column_name in column_names:
            if column_name != time_column:  # Skip plotting time column against itself
                # Check if the column is numerical or categorical to decide the type of plot
                if df[column_name].dtype in ['int64', 'float64']:
                    fig = px.scatter(
                        df, x=time_column, y=column_name,
                        title=f"Scatter Plot: {column_name} vs {time_column}",
                        labels={time_column: "Time", column_name: "Value"},
                    )
                elif df[column_name].dtype in ['object', 'bool']:
                    fig = px.box(
                        df, x=time_column, y=column_name,
                        title=f"Box Plot: {column_name} vs {time_column}",
                        labels={time_column: "Time", column_name: "Category"},
                    )
                
                if fig:
                    buffer = BytesIO()
                    fig.write_image(buffer, format="png")
                    buffer.seek(0)
                    
                    img_str = base64.b64encode(buffer.read()).decode("utf-8")
                    img_str_list.append(img_str)
                
    return img_str_list






# def generate_correlation_heatmap_url(df):
#     numerical_df = df.select_dtypes(include=['number'])
#     # Create Correlation Heatmap (r)
#     fig_corr = px.imshow(
#         numerical_df.corr(),
#         text_auto=True,
#         title='Correlation Heatmap (r)',
#         color_continuous_scale='RdBu_r',
#         aspect='auto'
#     )
#     fig_corr.update_layout(title_text="Correlation Heatmap(r)")
    
#     html_file_path = os.path.join(html_dir, "correlation_heatmap_r.html")
#     fig_corr.write_html(html_file_path)

    
#     return f"/static/Visualisations/correlation_heatmap_r.html"
    
# def generate_correlation_heatmap_squared_url(df):
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
    
#     html_file_path = os.path.join(html_dir, "correlation_heatmap_r².html")
#     fig_corr.write_html(html_file_path)
    
#     return f"/static/Visualisations/correlation_heatmap_r².html"

def generate_box_plot_url(df):
    numeric_df = df.select_dtypes(include=['number'])
    
    # Melt the DataFrame to have one column for "Variable" and another for "Value"
    df_melted = numeric_df.melt(var_name="Variable", value_name="Value")
    
    # Box plot for numerical variables
    fig_box = px.box(
        df_melted,
        x="Variable",
        y="Value",
        title=f'Box Plot of All Variables',
        color="Variable", # Different colors for each variable
    )
    
    fig_box.update_layout(
        xaxis_title="Variables",
        yaxis_title="Values",
        xaxis_tickangle=-45  # Rotate labels for better readability
    )
    html_file_path = os.path.join(html_dir,"box_plot.html")
    fig_box.write_html(html_file_path)
    
    return f"/static/Visualisations/box_plot.html"

# def generate_histogram_urls(df):
#     html_list = []
#     numerical_columns = df.select_dtypes(include=['number']).columns.to_list()
#     for column_name in numerical_columns:
#         # Histogram for numerical variables
#         fig = px.histogram(df, x=column_name, title=f"Histogram of {column_name}")
#         fig.update_layout(
#             xaxis_title=column_name,
#             yaxis_title="Frequency",
#             title_x=0.5  # Center the title
#         )
    
#         html_file_path = os.path.join(html_dir, f"histogram_{column_name}.html")
#         fig.write_html(html_file_path)
        
#         html_url = f"/static/Visualisations/histogram_{column_name}.html"
#         html_list.append(html_url)
    
#     return html_list

def generate_bar_plots_urls(df):
    html_list = []
    column_names = df.columns.to_list()
    for column_name in column_names:
        # Check if the column is categorical or boolean
        if df[column_name].dtype == 'object' or df[column_name].dtype == 'bool':
            counts_df = df[column_name].value_counts().reset_index()
            counts_df.columns = [column_name, "Count"]
            fig = px.bar(
                # df[column_name].value_counts().reset_index(),
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
                # df[column_name].value_counts().reset_index(),
                counts_df,
                x=column_name,
                y="Frequency",
                title=f"Bar Plot of {column_name} (Numerical Value Counts)",
                labels={column_name: column_name, "Frequency": "Frequency"},
            )
        
        html_file_path = os.path.join(html_dir, f"bar_plot_{column_name}.html")
        fig.write_html(html_file_path)
        
        html_url = f"/static/Visualisations/bar_plot_{column_name}.html"
        html_list.append(html_url)
    
    return html_list


def generate_time_plots_urls(df, time_columns):
    html_list = []
    column_names = df.columns.to_list()
    for time_column in time_columns:
        # For each time column, plot against every other column (that is not a time column)
        for column_name in column_names:
            if column_name != time_column:  # Skip plotting time column against itself
                # Check if the column is numerical or categorical to decide the type of plot
                if df[column_name].dtype in ['int64', 'float64']:
                    fig = px.scatter(
                        df, x=time_column, y=column_name,
                        title=f"Scatter Plot: {column_name} vs {time_column}",
                        labels={time_column: "Time", column_name: "Value"},
                    )
                elif df[column_name].dtype in ['object', 'bool']:
                    fig = px.box(
                        df, x=time_column, y=column_name,
                        title=f"Box Plot: {column_name} vs {time_column}",
                        labels={time_column: "Time", column_name: "Category"},
                    )
                
                if fig:
                    html_file_path = os.path.join(html_dir, f"time_plot_{column_name}.html")
                    fig.write_html(html_file_path)
        
                    html_url = f"/static/Visualisations/time_plot_{column_name}.html"
                    html_list.append(html_url)
                
    return html_list