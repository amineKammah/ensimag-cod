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
var age = 0;
// default checked button

function getdifferenceRaces() {
    var dataRaces = new Map();
    var shootingFilter;
    switch (armed) {
            case 0:
                shootingFilter = shootings_df;
                break;
            case 1:
                // armed
                shootingFilter = shootings_df.filter(row => row.get('Categorie arme') != 'Non Arme');
                console.log("armedd");
                break;
            case 2:
                // unarmed
                shootingFilter = shootings_df.filter(row => row.get('Categorie arme') == 'Non Arme');
                break;
            default:
                shootingFilter = shootings_df;
        }
    switch (age){
            case 1:
                // mineur
                shootingFilter = shootings_df.filter(row => row.get('Age') <= 18);
                console.log("mineur");
                break;
            case 2:
                // majeur
                shootingFilter = shootings_df.filter(row => row.get('Age') >= 19);
                console.log("majeur");
                break;
            default:
    }
    var totalNumberOfShootings = shootingFilter.dim()[0];
    for (var [key, value] of races){
        // récuperer le nombre du mort de cette races
        const stateShootingsDf = shootingFilter.filter(row => row.get('Ethnie') == key);
        const numberOfShootings = stateShootingsDf.dim()[0];
        var proportion = (numberOfShootings/totalNumberOfShootings)*100;
        dataRaces.set(key, parseFloat(proportion - value).toFixed(2));
    }
    console.log(dataRaces);
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

                                       min: -30,
                                       max: 40,
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
      } else if(document.getElementById("arme0").checked === true){
          armed = 1;
      } else if (document.getElementById("nonArme0").checked === true){

          armed = 2;
          console.log(armed);
      } else {
        armed = 3;
        console.log(armed);
      };
      if ((document.getElementById("mineur0").checked === true) && (document.getElementById("majeur0").checked === true)) {
          //exemple//
          age = 0;
      } else if(document.getElementById("mineur0").checked === true){
          age = 1;
      } else if (document.getElementById("majeur0").checked === true){

          age = 2;
          
      } else {
        age = 3;
      };
      dataRaces = getdifferenceRaces();
      barChartData = {
        labels: Array.from(dataRaces.keys()),
        datasets: [{
                label: 'Percentage',
                backgroundColor: '#95a5a6',
                borderColor: "#5f6a6a",
                borderWidth: 1,
                data: Array.from(dataRaces.values())
        }]

    };
    }   



       
document.getElementById('arme0').addEventListener('click', function() {
        
        checkButton();
        window.myBar.data = barChartData;
        window.myBar.update();
});

document.getElementById('nonArme0').addEventListener('click', function() {
        
        checkButton();
        window.myBar.data = barChartData;
        window.myBar.update();
});

document.getElementById('mineur0').addEventListener('click', function() {
        
        checkButton();
        window.myBar.data = barChartData;
        window.myBar.update();
});

document.getElementById('majeur0').addEventListener('click', function() {
        
        checkButton();
        window.myBar.data = barChartData;
        window.myBar.update();
});