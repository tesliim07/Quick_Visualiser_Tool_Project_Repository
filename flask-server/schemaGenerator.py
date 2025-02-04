import pandas as pd

# Function to map pandas types to PostgreSQL types
def map_dtype(dtype):
    if pd.api.types.is_integer_dtype(dtype):
        return "INTEGER"
    elif pd.api.types.is_float_dtype(dtype):
        return "FLOAT"
    elif pd.api.types.is_bool_dtype(dtype):
        return "BOOLEAN"
    elif pd.api.types.is_datetime64_any_dtype(dtype):
        return "TIMESTAMP"
    else:
        return "TEXT"  # Default to TEXT for categorical/object data

# Function to generate CREATE TABLE statement
def generate_create_table_sql(df, table_name):
    columns = ", ".join([f'"{col}" {map_dtype(dtype)}' for col, dtype in df.dtypes.items()])
    return f'CREATE TABLE IF NOT EXISTS {table_name} ({columns});'
