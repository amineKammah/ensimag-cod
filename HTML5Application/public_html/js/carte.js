import df from './dataLoader';
import statesData from './us-states';

var map = L.map('map').setView([37.8,-96], 4);
L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=i8upOzPaFmUXM0tH6yA4',
{
    maxZoom:18,
    attribution:'<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    tileSize:512,
    zoomOffset: -1
}).addTo(map);

// Control
var info = L.control();

// creates Dom elements for the layer, add them to map panes
info.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props){
    this._div.innerHTML = '<h4> Le nombre du mort </h4>'
    + (props ? '<b>' + props.name + '</b><br />' + props.density
    + 'morts' : 'survoler sur un état');
};

info.addTo(map);

// get color depending on death number

function getColor(d){
    return  d > 1000 ? '#800026' :
            d > 500  ? '#BD0026' :
            d > 200  ? '#E31A1C' :
            d > 100  ? '#FC4E2A' :
            d > 50   ? '#FD8D3C' :
            d > 20   ? '#FEB24C' :
            d > 10   ? '#FED976' :
                        '#FFEDA0';
}

function style(feature){
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density)
    };
}

function getStateRaceShootings(stateName) {
    const stateShootingsDf = df.filter(row => row.get('Etat') == stateName);
    const perRaceShootings = stateShootingsDf.groupBy('Ethnie').aggregate(group => group.count()).rename('aggregation', 'shootingsCount');
    const labels = perRaceShootings.select('Ethnie'), data =  perRaceShootings.select('shootingsCount');

    return [labels.toArray().flat(), data.toArray().flat()]
}
function displayGraph(props) {
    var ctx = document.getElementById('myDoughnutChart');

    const stateName = props.name
    const [labels, data] = getStateRaceShootings(stateName);
    var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
                datasets: [{
                    data: data,
                    // TODO: Create background colors
                    // backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f"]
                }],

                labels: labels
            },
        options: {
            title: {
                display : true,
                text: (props ? props.name :'survoler sur un état')
            }
        }
    });
}

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
    displayGraph(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
}

function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
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


var legend = L.control({position: 'bottomright'});

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