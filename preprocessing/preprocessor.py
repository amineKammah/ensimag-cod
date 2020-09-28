import pandas as pd

from preprocessing_utils import PreprocessingUtils


def _preprocess_race_distribution(race_dist_df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocesses the race distribution data:
    - Drops useless columns such as 'Total'
    - Replaces missing values with 0
    - Replaces low frequency values (<0.1) with 0
    - Combines 'Native Hawaiian/Other Pacific Islander' and 'Two Or More Races' into one column 'Other'
    - Translate file from French to English
    """
    race_dist_df = race_dist_df.drop('Total', axis=1)
    race_dist_df = PreprocessingUtils.impute_missing_values(race_dist_df)

    minorities = [
        'Black', 'American Indian/Alaska Native',
        'Native Hawaiian/Other Pacific Islander', 'Two Or More Races'
    ]
    race_dist_df = PreprocessingUtils.map_values(race_dist_df, {'<.01': 0}, minorities)
    race_dist_df[minorities] = race_dist_df[minorities].astype(float)
    race_dist_df['Others'] = (
            race_dist_df['Native Hawaiian/Other Pacific Islander'] + race_dist_df['Two Or More Races']
    )
    race_dist_df = race_dist_df.drop(['Native Hawaiian/Other Pacific Islander', 'Two Or More Races'], axis=1)

    columns_name_translation = {
        "Location": "Code Etat", "State": "Etat", "White": "Blanc", "Black": "Noir", "Hispanic": "Hispanique",
        "American Indian/Alaska Native": "Natif" , "Asian": "Asiatique", "Others": "Autre"
    }

    race_dist_df = PreprocessingUtils.set_columns_names(race_dist_df, columns_name_translation)

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

    # Manner of death does not provide useful information
    df = df.drop('manner_of_death', axis=1)

    df.age = df.age.astype(int)

    race_column_translation = {
        "White": "Blanc", "Black": "Noir", "Hispanic": "Hispanique", "Asian": "Asiatique",
        "Native": "Natif", "Other": "Autre",
    }
    df = PreprocessingUtils.map_values(df, race_column_translation, ['race'])

    flee_column_translation = {
        "Not fleeing": "Pas de fuite", "Car": "En voiture", "Foot": "A pied", "Other": "Autre",
    }
    df = PreprocessingUtils.map_values(df, flee_column_translation, ['flee'])

    arms_cat_column_translation = {
        "Guns": "Arme a feu", "Unarmed": "Non Arme", "Sharp objects": "Objet tranchant", "Unknown": "Autre",
        "Other unusual objects": "Autre", "Blunt instruments": "Autre", "Vehicles": "Autre", "Multiple": "Autre",
        "Piercing objects": "Autre", "Electrical devices": "Autre", "Explosives": "Autre", "Hand tools": "Autre",
    }
    df = PreprocessingUtils.map_values(df, arms_cat_column_translation, ['arms_category'])

    threat_lvl_translation = {"attack": "Attaque", "undetermined": "Indetermine", "other": "Autre"}
    df = PreprocessingUtils.map_values(df, threat_lvl_translation, ['threat_level'])

    columns_name_translation = {
        "id": "id", "arms_category": "Categorie arme", "race": "Ethnie", "gender": "Sexe",
        "flee": "Fuite", "state": "Code Etat", "signs_of_mental_illness" : "Signes de maladie mentale",
        "age": "Age", "threat_level" : "Niveau de menace", "body_camera": "Camera corporelle",
        "month": "Mois", "year": "Annee", "day_of_month": "Jour du mois"
    }

    df = PreprocessingUtils.set_columns_names(df, columns_name_translation)

    return df


def main() -> None:
    """
    Reads raw data and processes it and saves the result in a convenient format.
    """
    print("Loading and preprocessing 'race_distribution_data.csv'.")
    race_distribution_path = "data/race_distribution_data.csv"
    race_dist_df = pd.read_csv(race_distribution_path)

    race_dist_df = _preprocess_race_distribution(race_dist_df)

    print("Saving to 'data/preprocessed_dataset.json'.\n")
    race_dist_df.to_json('data/race_data.json', orient='records')

    print("Loading and preprocessing 'raw_shooting_data.csv'.")
    raw_data_path = "data/raw_shooting_data.csv"
    raw_df = pd.read_csv(raw_data_path)

    df = _preprocess_shootings_data(raw_df)
    df = PreprocessingUtils.merge_dataframe(df, race_dist_df[['Code Etat', 'Etat']], on='Code Etat')
    print("Saving to 'data/shootings_dataset.json'.")
    df.to_json('data/shootings_data.json', orient='records')

    print("Done.")


if __name__ == '__main__':
    main()
