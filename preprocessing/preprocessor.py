import pandas as pd

from Preprocessing_utils import PreprocessingUtils


def _preprocess_race_distribution(race_dist_df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocesses the race distribution data:
    - Replaces missing values with 0
    - Replaces low frequency values (<0.1) with 0
    """
    race_dist_df = PreprocessingUtils.impute_missing_values(race_dist_df)

    columns = race_dist_df.columns.tolist()
    race_dist_df = PreprocessingUtils.map_values(race_dist_df, {'<.01': 0}, columns)

    return race_dist_df


def _preprocess_shootings_data(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocesses the raw shooting data:
    - Extracts Year, Month and Day of month from date column
    - Removes high dimension columns as they do not provide a good visualization source
    - Translate some columns values from English to French in order to facilitate visualization in French
    - Translate columns names from English to French in order to facilitate visualization in French
    """
    df = PreprocessingUtils.parse_date(raw_df)
    df = PreprocessingUtils.remove_high_dim_columns(df)

    race_column_translation = {
        "White": "Blanc", "Black": "Noir", "Hispanic": "Hispanique", "Asian": "Asiatique",
        "Native": "Natif", "Other": "Autre",
    }
    df = PreprocessingUtils.map_values(df, race_column_translation, ['race'])

    flee_column_translation = {
        "Not fleeing": "Pas de fuite", "Car": "En voiture", "Foot": "A pied", "Other": "Autre",
    }
    df = PreprocessingUtils.map_values(df, flee_column_translation, ['flee'])

    # TODO: Check this
    arms_cat_column_translation = {
        "Guns": "Arme à feu", "Unarmed": "Non Armé", "Sharp objects": "Objets tranchants", "Unknown": "Autre",
        "Other unusual objects": "Autre", "Blunt instruments": "Autre", "Vehicles": "Autre", "Multiple": "Autre",
        "Piercing objects": "Autre", "Electrical devices": "Autre", "Explosives": "Autre", "Hand tools": "Autre",
    }
    df = PreprocessingUtils.map_values(df, arms_cat_column_translation, ['arms_category'])

    columns_name_translation = {
        "arms_category": "Cathegorie_arme", "race": "Ethnie", "gender": "Sexe", "flee": "Fuite", "state": "Etat",
    }
    df = PreprocessingUtils.set_columns_names(df, columns_name_translation)

    return df


def main() -> None:
    """
    Reads raw data and processes it and saves the result in a convenient format.
    """
    race_distribution_path = "../data/race_distribution_data.csv"
    race_dist_df = pd.read_csv(race_distribution_path)

    race_dist_df = _preprocess_race_distribution(race_dist_df)

    raw_data_path = "../data/raw_shootings_data.csv"
    raw_df = pd.read_csv(raw_data_path)

    df = _preprocess_shootings_data(raw_df)

    joined_df = PreprocessingUtils.merge_dataframe(df, race_dist_df, left_on='Etat', right_on='Location')

    joined_df.to_csv('../data/processed.csv')
