import { shootings_df, race_df } from './dataLoader';

export default class DataProcessingUtils {
    /*
    * Class containing multiple static methods to process data for charts
    */

    static PrepAnimatedLinesData() {
        /*
        * Outputs a collection of the number of shootings per race per month, multiplied by (1 - the population ratio of the race).
        * To be used with the animated lines chart
        */
        const races = shootings_df.unique('Ethnie').toArray().flat();

        var selectedDf = shootings_df.select('Annee', 'Mois', 'Ethnie');
        selectedDf = selectedDf.cast('Annee', String);
        selectedDf = selectedDf.cast('Mois', String);
        // Recreate JS Dates instances to use the dates in the x-axis
        selectedDf = selectedDf.withColumn('Date', row => new Date(row.get('Mois') + "/01/" + row.get("Annee")));
        // Count the number of shootings per date per race
        var groupedDf = (
            selectedDf.groupBy('Date', 'Ethnie')
                .aggregate(group => group.count())
                .rename('aggregation', 'groupCount')
        )
        
        // Race ratios in the US
        const USracePct = race_df.filter(row => row.get('Code Etat') == 'US').toCollection()[0];
      
        // Multiply number of shootings by  (1 - race percentage in the US)
        groupedDf = groupedDf.map(row => row.set('groupCount', row.get('groupCount') * (1 - USracePct[row.get('Ethnie')])))

        // Maximum value to setup y-axis
        const maxValue = groupedDf.stat.max('groupCount');
        // Min and max values to setup x-axis
        const minDate = groupedDf.stat.min('Date'), maxDate = selectedDf.stat.max('Date')

        const perRaceData = []
        for (const race of races) {
            perRaceData.push(groupedDf.filter(row => row.get("Ethnie") == race).toCollection());
        }
      
        return [perRaceData, maxValue, minDate, maxDate]
      }

      static prepDoughnutData(stateName, age, armed) {
        /*
        * Outputs the number of shootings per race in a specific state
        * To be used to draw a Doughnut.
        */

        // Keep shootings that happened in `stateName`
        var stateShootingsDf;
        switch (age) {
            case 1:
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName && row.get('Age') <= 18);
                break;
            case 2:
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName && row.get('Age') >= 19);
                break;
            default:
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName);
        }
        switch (armed) {
            case 2:
                stateShootingsDf = stateShootingsDf.filter(row => row.get('Categorie arme') == 'Non Arme');
                break;
            case 1:
                stateShootingsDf = stateShootingsDf.filter(row => row.get('Categorie arme') != 'Non Arme');
                break;
        }
        // Get number of shootings per race
        var perRaceShootings = (
            stateShootingsDf.groupBy('Ethnie')
                .aggregate(group => group.count())
                .rename('aggregation', 'shootingsCount')
        );

        // divide by state race ratio
        perRaceShootings = perRaceShootings.map(
            row => (
                row.set('shootingsCount', row.get('shootingsCount') * (1 - DataProcessingUtils.getStateRaceRatio(stateName, row.get('Ethnie'))))
            )
        );

        var labels = perRaceShootings.select('Ethnie').toArray().flat();

        var shootingsCountsDf = perRaceShootings.select('shootingsCount');
        // turning the data into percentages
        var sum = shootingsCountsDf.stat.sum('shootingsCount');
        var normalizedData = [];
        shootingsCountsDf.toArray().flat().forEach(element => normalizedData.push((element * 100 / sum).toFixed(2)));

        return [labels, normalizedData]
    }

    static getStateRaceRatio(stateName, ethnie) {
        return race_df.filter(row => row.get('Etat') == stateName).select(ethnie).toArray()[0][0];
    }

    static getAllRacesRatios(stateName) {
        /* Get all the races ratios in a state */
        return race_df.filter(row => row.get('Etat') == stateName).toCollection()[0];
    }

    static numberOfShootingsInState(stateName, age, armed) {
        /*
        * Number of shootings in a state
        * to be displayed in the top right side of the map
        */

        var stateShootingsDf;

        switch (age) {
            case 1:
                // Filter only minor victims
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName && row.get('Age') <= 18);
                break;
            case 2:
                // Filter only adult victims
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName && row.get('Age') >= 19);
                break;
            default:
                // Keep all ages
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName);
        }
        switch (armed) {
            case 2:
                // Filter only unarmed
                stateShootingsDf = stateShootingsDf.filter(row => row.get('Categorie arme') == 'Non Arme');
                break;
            case 1:
                // Filter only armed
                stateShootingsDf = stateShootingsDf.filter(row => row.get('Categorie arme') != 'Non Arme');
                break;
        }

        const numberOfShootings = stateShootingsDf.dim()[0];
        return numberOfShootings;
    }
}
