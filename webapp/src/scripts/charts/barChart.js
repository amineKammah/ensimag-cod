import DataProcessingUtils from '../dataTreatment/dataProcessingUtils';

class BarChart {
    /**
        Draw a Bar chart with the differences between the pourcentage of the victime
        population and the total population
    **/
    static init() {
        BarChart.races = DataProcessingUtils.getAllRacesRatios(" United States");
        BarChart.armed = 0;
        BarChart.age = 0;
        BarChart.ilness = false;
        BarChart.nonIlness = false;
        BarChart.fuite = 0;

        BarChart.setUpFilteringButtons()
    }

    render() {
        BarChart.init();

        const barChartData = BarChart.loadData();
        const ctx = document.getElementById('barChart').getContext('2d');

        const chartParams = {
            type: 'bar',
            data: barChartData,
            options: {
                title: {
                    display: true,
                    text: "Différence entre la proportion de chaque ethnie et du nombre de victimes qu'elle compte"
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            min: -40,
                            max: 40,
                            callback: value => value + "%"
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Percentage"
                        }
                    }]
                }

            }
        }

        if (window.myBar)
            // Destroys old doughnut before drawing a new one
            window.myBar.destroy();
        window.myBar = new Chart(ctx, chartParams);
    }

    static loadData() {
        var perRaceData = {};
        var filteredShootingsData = DataProcessingUtils.prepBarChartData(
            BarChart.armed, BarChart.age, BarChart.fuite, BarChart.ilness, BarChart.nonIlness
        );
        var totalNumberOfShootings = filteredShootingsData.dim()[0];

        // Normalizing the data
        for (var [key, value] of Object.entries(BarChart.races)) {
            // récuperer le nombre du mort de cette races
            const stateShootingsDf = filteredShootingsData.filter(row => row.get('Ethnie') == key);
            const numberOfShootings = stateShootingsDf.dim()[0];
            var proportion = (numberOfShootings / totalNumberOfShootings) * 100;
            perRaceData[key] = parseFloat(proportion - value * 100).toFixed(2);
        }

        const barChartData = {
            labels: Array.from(Object.keys(perRaceData)),
            datasets: [{
                label: 'Percentage',
                backgroundColor: '#EC7063',
                borderColor: "#EC7063",
                borderWidth: 1,
                data: Array.from(Object.values(perRaceData))
            }]
        };
        return barChartData
    }

    static readFiltersValues() {
        if (document.getElementById("Toutarme0").checked)
            BarChart.armed = 0;
        else if (document.getElementById("arme0").checked)
            BarChart.armed = 1;
        else if (document.getElementById("nonArme0").checked)
            BarChart.armed = 2;
        else
            BarChart.armed = 0;

        if (document.getElementById("Toutfuite0").checked)
            BarChart.fuite = 0;
        else if (document.getElementById("fuiteY").checked)
            BarChart.fuite = 1;
        else if (document.getElementById("fuiteN").checked)
            BarChart.fuite = 2;
        else
            BarChart.fuite = 0;

        if (document.getElementById("Toutage0").checked)
            BarChart.age = 0;
        else if (document.getElementById("mineur0").checked)
            BarChart.age = 1;
        else if (document.getElementById("majeur0").checked)
            BarChart.age = 2;
        else
            BarChart.age = 0;

        if (document.getElementById("mentalY").checked)
            BarChart.ilness = true;
        else
            BarChart.ilness = false;
        if (document.getElementById("mentalN").checked)
            BarChart.nonIlness = true;
        else
            BarChart.nonIlness = false;
    }

    static updateChart() {

        BarChart.readFiltersValues();

        const barChartData = BarChart.loadData();

        window.myBar.data = barChartData;
        window.myBar.update();
    }

    static setUpFilteringButtons() {
        const filtersIds = ['Toutarme0', 'arme0', 'nonArme0', 'Toutage0', 'mineur0', 'majeur0', 'Toutmental0', 'mentalY', 'mentalN', 'Toutfuite0', 'fuiteN', 'fuiteY']
        filtersIds.forEach(id => document.getElementById(id).addEventListener('click', BarChart.updateChart))
    }
}

new BarChart().render()