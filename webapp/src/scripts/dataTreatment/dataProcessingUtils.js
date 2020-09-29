import { shootings_df, race_df } from './dataLoader';

export default class DataProcessingUtils {
    /*
    * Class containing multiple static methods to process data for charts
    */

    static PrepAnimatedLinesData() {
        /*
        * Outputs the number of shootings per race per month, divided by the population ratio of the race.
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

        // Race percentages in the US
        const USracePct = race_df.filter(row => row.get('Code Etat') == 'US').toCollection()[0];

        // Divide number of shootings by race percentage in the US
        selectedDf = selectedDf.map(row => row.set('groupCount', row.get('groupCount') / USracePct[row.get('Ethnie')]))

        // Maximum value to setup y-axis
        const maxValue = selectedDf.stat.max('groupCount');

        const perRaceData = []
        for (const race of races) {
          perRaceData.push(selectedDf.filter(row => row.get("Ethnie") == race).toCollection());
        }

        return [perRaceData, maxValue]
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
                console.log('mineur')
                break;
            case 2:
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName && row.get('Age') >= 19);
                console.log('majeur')
                break;
            default:
                stateShootingsDf = shootings_df.filter(row => row.get('Etat') == stateName);
                console.log('all pour age')
        }
        switch (armed) {
            case 2:
                stateShootingsDf = stateShootingsDf.filter(row => row.get('Categorie arme') == 'Non Arme');
                console.log('non arme')
                break;
            case 1:
                stateShootingsDf = stateShootingsDf.filter(row => row.get('Categorie arme') != 'Non Arme');
                console.log('arme')
                break;
            default:
                console.log('all arme')
        }
        // Get number of shootings per race
        var perRaceShootings = (
            stateShootingsDf.groupBy('Ethnie')
            .aggregate(group => group.count())
            .rename('aggregation', 'shootingsCount')
        );

        // divide by state race ratio
        perRaceShootings = perRaceShootings.map(row => row.set('shootingsCount', row.get('shootingsCount') / race_df.filter(row => row.get('Etat') == stateName).select(row.get('Ethnie')).toArray()[0][0]));

        var labels = perRaceShootings.select('Ethnie'), data = perRaceShootings.select('shootingsCount');

        // turning the data into percentages
        var sum = 0;
        data = data.toArray().flat()
        data.forEach(element => sum += element);
        var newData = [];
        data.forEach(element => newData.push(element * 100 / sum));

        return [labels.toArray().flat(), newData]
    }

    static numberOfShootingsInState(stateName, age, armed) {
        /*
        * Number of shootings in a state
        * to be displayed in the top right side of the map
        */

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

        return stateShootingsDf.dim()[0]
    }
}
