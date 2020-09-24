from typing import Any, List

import pandas as pd


class PreprocessingUtils:
    @staticmethod
    def merge_dataframe(
        df1: pd.DataFrame, df2: pd.DataFrame, on: str
    ) -> pd.DataFrame:
        """
        Left joins 2 dataframes on specific columns.
        """

        merged_df = df1.merge(df2, how="left", on=on)
        return merged_df

    @staticmethod
    def parse_date(df: pd.DataFrame, date_field: str = "date") -> pd.DataFrame:
        """
        Extracts the year, the month and the day of the month from the date
        """
        df = df.copy()

        datetime_column = pd.to_datetime(df[date_field])
        df["month"] = datetime_column.dt.month
        df["year"] = datetime_column.dt.year
        df["day_of_month"] = datetime_column.dt.day

        return df

    @staticmethod
    def remove_high_dim_columns(
        df: pd.DataFrame, threshold: int = 80, to_keep: List[str] = ["id"]
    ) -> pd.DataFrame:
        """
        Removes columns with a dimension higher than the specified threshold.
        Keeps the columns specified in 'to_keep'.
        """
        df = df.copy()

        to_drop = [
            column
            for column in df.columns
            if (df[column].nunique() > threshold) and (column not in to_keep)
        ]
        df = df.drop(to_drop, axis=1)

        return df

    @staticmethod
    def set_columns_names(df: pd.DataFrame, mapping: dict) -> pd.DataFrame:
        """
        Takes a DataFrame and a dictionary mapping old column names to new ones.
        """
        df = df.copy()

        columns = df.columns
        new_columns_names = [mapping[column] for column in columns]
        df.columns = new_columns_names

        return df

    @staticmethod
    def map_values(df: pd.DataFrame, mapping: dict, columns: List[str]) -> pd.DataFrame:
        """
        Replace old values in a column by new ones specified in a dictionary 'mapping'.
        """
        df = df.copy()

        for column_name in columns:
            mapped_column = df[column_name].replace(mapping)
            df[column_name] = mapped_column

        return df

    @staticmethod
    def impute_missing_values(df: pd.DataFrame, fill_value: Any = 0) -> pd.DataFrame:
        """
        Fills the missing values in a DataFrame with fill_value
        """

        return df.fillna(fill_value)
