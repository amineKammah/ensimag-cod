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
var ilness = false;
var nonIlness = false;
var fuite = 0;
// default checked button

function getdifferenceRaces() {
    var dataRaces = new Map();
    var shootingFilter = shootings_df;
    switch (armed) {
            case 1:
                // armed
                shootingFilter = shootingFilter.filter(row => row.get('Categorie arme') != 'Non Arme');
                console.log("armedd");
                break;
            case 2:
                // unarmed
                shootingFilter = shootingFilter.filter(row => row.get('Categorie arme') == 'Non Arme');
                break;
        };
    switch (age){
            case 1:
                // mineur
                shootingFilter = shootingFilter.filter(row => row.get('Age') <= 18);
                console.log("mineur");
                break;
            case 2:
                // majeur
                shootingFilter = shootingFilter.filter(row => row.get('Age') >= 19);
                console.log("majeur");
                break;
    };
    switch (fuite){
            case 1:
                // fuite
                shootingFilter = shootingFilter.filter(row => row.get('Fuite') != 'Pas de fuite');
                
                break;
            case 2:
                // Not fleeing
                shootingFilter = shootingFilter.filter(row => row.get('Fuite') == "Pas de fuite");
              
                break;
    };
    console.log(shootingFilter.dim()[0]);
    if ((ilness ^ nonIlness)){
        if (ilness){
             shootingFilter = shootingFilter.filter(row => row.get('Signes de maladie mentale') == 1);
            
        }
        if (nonIlness){
            shootingFilter = shootingFilter.filter(row => row.get('Signes de maladie mentale') == 0);
        }
       
    }
    var totalNumberOfShootings = shootingFilter.dim()[0];
    for (var [key, value] of races){
        // récuperer le nombre du mort de cette races
        const stateShootingsDf = shootingFilter.filter(row => row.get('Ethnie') == key);
        const numberOfShootings = stateShootingsDf.dim()[0];
        var proportion = (numberOfShootings/totalNumberOfShootings)*100;
        dataRaces.set(key, parseFloat(proportion - value).toFixed(2));
    }
    //console.log(dataRaces);
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

                                       min: -40,
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
          
      } else {
        armed = 0;
      };
      if ((document.getElementById("fuiteY").checked === true) && (document.getElementById("fuiteN").checked === true)) {
          //exemple//
          fuite = 0;
      } else if(document.getElementById("fuiteY").checked === true){
          fuite = 1;
      } else if (document.getElementById("fuiteN").checked === true){

          fuite = 2;
          
      } else {
        fuite = 0;
      };
      
      if ((document.getElementById("mineur0").checked === true) && (document.getElementById("majeur0").checked === true)) {
          //exemple//
          age = 0;
      } else if(document.getElementById("mineur0").checked === true){
          age = 1;
      } else if (document.getElementById("majeur0").checked === true){

          age = 2;
          
      } else {
        age = 0;
      };
      if (document.getElementById("mentalY").checked === true) {
          //exemple//
          ilness = true;
      } else {
          ilness = false;
      };
      if (document.getElementById("mentalN").checked === true) {
          //exemple//
          nonIlness = true;
      } else {
          nonIlness = false;
      };
    }   


function updateData(){
        checkButton();
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
        window.myBar.data = barChartData;
        window.myBar.update();
}
       
document.getElementById('arme0').addEventListener('click', updateData);
document.getElementById('nonArme0').addEventListener('click', updateData);
document.getElementById('mineur0').addEventListener('click', updateData);
document.getElementById('majeur0').addEventListener('click', updateData);
document.getElementById('mentalY').addEventListener('click', updateData);
document.getElementById('mentalN').addEventListener('click', updateData);
document.getElementById('fuiteN').addEventListener('click', updateData);
document.getElementById('fuiteY').addEventListener('click', updateData);