import dataProcessingUtils from '../dataTreatment/dataProcessingUtils';
import statesData from '../dataTreatment/us-states';

var map = L.map('map').setView([37.8, -96], 4);
L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=i8upOzPaFmUXM0tH6yA4',
    {
        maxZoom: 18,
        attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);

// initialisation des variable armed and age
var armed = 0;
var age = 0;


console.log(armed);
// Control
var info = L.control();

// creates Dom elements for the layer, add them to map panes
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    // ici je veux récuperer le nombre du mort dans cette état
    const stateName = (props ? props.name : "Texas");


    const numberOfShootings = dataProcessingUtils.numberOfShootingsInState(stateName)

    this._div.innerHTML = '<h4> Le nombre du mort </h4>'
        + (props ? '<b>' + name + '</b><br />' + numberOfShootings
            + ' morts' : 'survoler sur un état');
};

info.addTo(map);

// get color depending on death number

function getColor(d) {
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
            d > 200 ? '#E31A1C' :
                d > 100 ? '#FC4E2A' :
                    d > 50 ? '#FD8D3C' :
                        d > 20 ? '#FEB24C' :
                            d > 10 ? '#FED976' :
                                '#FFEDA0';
}

function style(feature) {


    var numberOfShootings = 0;
    if (feature.properties) {
        const stateName = feature.properties.name;
        numberOfShootings = dataProcessingUtils.numberOfShootingsInState(stateName);
    }
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(numberOfShootings)
    };
}

function getBackgrounColors(racesList) {
    // Takes the races present in a state and output their corresponding background color
    const raceColors = {
        "Blanc": "#5b2c6f", "Noir": "#d35400", "Hispanique": "#5499c7 ",
        "Asiatique": "#48c9b0", "Natif": "#2e4053", "Autre": "#f4d03f"
    };
    const backgroundColors = [];

    racesList.forEach(race => backgroundColors.push(raceColors[race]));

    return backgroundColors;
}

var chart;
function displayRaceRepartition(stateName) {

  //check
  if (document.getElementById("ToutArme").checked === true) {
          //exemple//
          armed = 0;
      } else if(document.getElementById("Arme").checked === true){
          armed = 1;

      } else if (document.getElementById("nonArme").checked === true){

          armed = 2;
      };
    if (document.getElementById("Toutage").checked === true) {
          //exemple//
          age = 0;
      } else if(document.getElementById("Mineur").checked === true){
          age = 1;

      } else if (document.getElementById("Majeur").checked === true){

          age = 2;
      };

    var ctx = document.getElementById('raceRepartitionChart');
    if (ctx != "") {
        document.getElementById('raceRepartitionChart').innerHTML = "";
    }

    const [labels, data] = dataProcessingUtils.prepDoughnutData(stateName);
    const backgroundColor = getBackgrounColors(labels);

    if (chart) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: data,
                backgroundColor: backgroundColor,
            }],

            labels: labels
        },
        options: {
            title: {
                display: true,
                text: stateName,
                tooltips: {enabled: false},
                mousemove: {mode: null},
                mouseout: {mode: null},
            }
        }
    });
}
// affichage par défaut de l'état texas
function byDefault() {
    displayRaceRepartition('Texas');
}
byDefault();
// event listener for layer mouseover event
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function zoomToFeature(e) {
    var layer = e.target;
    displayRaceRepartition(layer.feature.properties.name);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);
