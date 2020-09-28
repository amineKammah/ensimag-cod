/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import { shootings_df, race_df} from './dataLoader';
import statesData from './us-states';

var races = new Map();
races.set("Noir",12.3);
races.set("Hispanique",16.7);
races.set("Blanc",63.7);
races.set("Asiatique",4.7);
races.set("Autre",1.9);
races.set("Natif",0.7);

console.log(races);

var armed = 0;
function getdifferenceRaces() {
    var dataRaces = new Map();
    const totalNumberOfShootings = shootings_df.dim()[0];
    for (var [key, value] of races){
        // récuperer le nombre du mort de cette races
        const stateShootingsDf = shootings_df.filter(row => row.get('Ethnie') == key);
        const numberOfShootings = stateShootingsDf.dim()[0];
        var proportion = (numberOfShootings/totalNumberOfShootings)*100;
        dataRaces.set(key, parseFloat(proportion - value).toFixed(2));
    }
    
    return dataRaces;
}

var dataRaces = getdifferenceRaces();
var color = Chart.helpers.color;



var barChartData = {
        labels: Array.from(dataRaces.keys()),
        datasets: [{
                label: 'Percentage',
                backgroundColor: '#95a5a6',
                borderColor: "#5f6a6a",
                borderWidth: 1,
                data: Array.from(dataRaces.values())
        }]

};

window.onload = function() {
        var ctx = document.getElementById('barChart').getContext('2d');
        window.myBar = new Chart(ctx, {
                type: 'bar',
                data: barChartData,
                options: {
                        title: {
                                display: true,
                                text: 'Différence entre le pourcentage de la population et de la victime'
                        },
                        scales:{
                            yAxes: [{
                                ticks: {

                                       min: -20,
                                       max: 20,
                                       callback: function(value){return value+ "%"}
                                    },  
                                                                                    scaleLabel: {
                                       display: true,
                                       labelString: "Percentage"
                                    }
                                }]
                        }
                        
                }
        });

};

if (document.getElementById("ToutArme").checked === true) {
          //exemple//
          armed = 0;
      } else if(document.getElementById("Arme").checked === true){
          armed = 1;

      } else if (document.getElementById("nonArme").checked === true){

          armed = 2;
      };
document.getElementById('ToutArme0').addEventListener('click', function() {
        armed = 0;
        /*
        var zero = Math.random() < 0.2 ? true : false;
        barChartData.datasets.forEach(function(dataset) {
                dataset.data = dataset.data.map(function() {
                        return zero ? 0.0 : randomScalingFactor();
                });

        });
         */
        window.myBar.update();
});

document.getElementById('Arme1').addEventListener('click', function() {
        armed = 0;
        /*
        var zero = Math.random() < 0.2 ? true : false;
        barChartData.datasets.forEach(function(dataset) {
                dataset.data = dataset.data.map(function() {
                        return zero ? 0.0 : randomScalingFactor();
                });

        });
         */
        window.myBar.update();
});

var colorNames = Object.keys(window.chartColors);
document.getElementById('addDataset').addEventListener('click', function() {
        var colorName = colorNames[barChartData.datasets.length % colorNames.length];
        var dsColor = window.chartColors[colorName];
        var newDataset = {
                label: 'Dataset ' + (barChartData.datasets.length + 1),
                backgroundColor: color(dsColor).alpha(0.5).rgbString(),
                borderColor: dsColor,
                borderWidth: 1,
                data: []
        };

        for (var index = 0; index < barChartData.labels.length; ++index) {
                newDataset.data.push(randomScalingFactor());
        }

        barChartData.datasets.push(newDataset);
        window.myBar.update();
});

document.getElementById('addData').addEventListener('click', function() {
        if (barChartData.datasets.length > 0) {
                var month = MONTHS[barChartData.labels.length % MONTHS.length];
                barChartData.labels.push(month);

                for (var index = 0; index < barChartData.datasets.length; ++index) {
                        // window.myBar.addData(randomScalingFactor(), index);
                        barChartData.datasets[index].data.push(randomScalingFactor());
                }

                window.myBar.update();
        }
});

document.getElementById('removeDataset').addEventListener('click', function() {
        barChartData.datasets.pop();
        window.myBar.update();
});

document.getElementById('removeData').addEventListener('click', function() {
        barChartData.labels.splice(-1, 1); // remove the label first

        barChartData.datasets.forEach(function(dataset) {
                dataset.data.pop();
        });

        window.myBar.update();
});