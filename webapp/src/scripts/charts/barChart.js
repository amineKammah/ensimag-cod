/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
import { shootings_df, race_df} from '../dataTreatment/dataLoader';


var races = new Map();
races.set("Noir",12.3);
races.set("Hispanique",16.7);
races.set("Blanc",63.7);
races.set("Asiatique",4.7);
races.set("Autre",1.9);
races.set("Natif",0.7);

console.log(races);

var armed = 0;

// default checked button

function getdifferenceRaces() {
    var dataRaces = new Map();
    
    if (armed === 0){
        const totalNumberOfShootings = shootings_df.dim()[0];
        const stateShootingsDf = shootings_df.filter(row => row.get('Ethnie') == key);
    }
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

function checkButton(){
    if ((document.getElementById("arme0").checked === true) && (document.getElementById("nonArme0").checked === true)) {
          //exemple//
          armed = 0;
          console.log("helllloooo")
      } else if(document.getElementById("arme0").checked === true){
          armed = 1;
          console.log(armed);
      } else if (document.getElementById("nonArme0").checked === true){

          armed = 2;
          console.log(armed);
      } else {
        armed = 3;
        console.log(armed);
      };
    }   



       
document.getElementById('arme0').addEventListener('click', function() {
        
        checkButton();
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

document.getElementById('nonArme0').addEventListener('click', function() {
        
        checkButton();
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
