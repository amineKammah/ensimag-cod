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
      
        let selectedDf = shootings_df.select('Annee', 'Mois', 'Ethnie');
        selectedDf = selectedDf.cast('Annee', String);
        selectedDf = selectedDf.cast('Mois', String);
        // Recreate JS Dates instances to use the dates in the x-axis
        selectedDf = selectedDf.withColumn('Date', row => new Date(row.get('Mois') + "/01/" + row.get("Annee")));
        // Count the number of shootings per date per race
        selectedDf = (
            selectedDf.groupBy('Date', 'Ethnie')
            .aggregate(group => group.count())
            .rename('aggregation', 'groupCount')
        )
        
        // Race ratios in the US
        const USracePct = race_df.filter(row => row.get('Code Etat') == 'US').toCollection()[0];
      
        // Multiply number of shootings by  (1 - race percentage in the US)
        selectedDf = selectedDf.map(row => row.set('groupCount', row.get('groupCount') * (1 - USracePct[row.get('Ethnie')])))

        // Maximum value to setup y-axis
        const maxValue = selectedDf.stat.max('groupCount');
        // Min and max values to setup x-axis
        const minDate = selectedDf.stat.min('Date'), maxDate = selectedDf.stat.max('Date')
      
        const perRaceData = []
        for (const race of races) {
          perRaceData.push(selectedDf.filter(row => row.get("Ethnie") == race).toCollection());
        }
      
        return [perRaceData, maxValue, minDate, maxDate]
      }

    static prepDoughnutData(stateName) {
        /*
        * Outputs a collection of the numbers of shootings per race in a specific state
        * To be used to draw a Doughnut.
        */

        // Keep shootings that happened in `stateName`
        const stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName);
        // Get number of shootings per race
        const perRaceShootings = (
            stateShootingsDf.groupBy('Ethnie')
            .aggregate(group => group.count())
            .rename('aggregation', 'shootingsCount')
        );

        const labels = perRaceShootings.select('Ethnie'), data = perRaceShootings.select('shootingsCount');
    
        return [labels.toArray().flat(), data.toArray().flat()]
    }

    static numberOfShootingsInState(stateName) {
        /*
        * Outputs the total number of shootings in a state
        * to be displayed in the top right side of the map
        */

        const stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName);
        return stateShootingsDf.dim()[0]
    }
}
