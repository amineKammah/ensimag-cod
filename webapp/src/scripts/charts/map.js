import { Map } from 'core-js';
import dataProcessingUtils from '../dataTreatment/dataProcessingUtils';
import statesData from '../dataTreatment/us-states';

class MapPlotter {
    /*
    * Draws a USA map with the number of shootings in each state, When a state is clicked,
    * displays a doughnut containing the shootings repartition per race
    */

    render() {
        MapPlotter.setUpFilteringButtons();
        MapPlotter.readFiltersValues();
        
        MapPlotter.currentStateName = 'Texas';
        MapPlotter.drawRaceDoughnut();

        MapPlotter.drawMap();
    }

    static getMapIntensity(numberOfShootings) {
        /* Returns the corresponding color to the number of shootings */
        return numberOfShootings > 700 ? '#800026' :
            numberOfShootings > 350 ? '#BD0026' :
                numberOfShootings > 200 ? '#E31A1C' :
                    numberOfShootings > 100 ? '#FC4E2A' :
                        numberOfShootings > 50 ? '#FD8D3C' :
                            numberOfShootings > 20 ? '#FEB24C' :
                                numberOfShootings > 10 ? '#FED976' :
                                    '#FFEDA0';
    }

    static getBackgroundColors(racesList) {
        /* Takes an array of races and output their corresponding background color */

        const raceColors = {
            "Blanc": "#5b2c6f", "Noir": "#d35400", "Hispanique": "#5499c7 ",
            "Asiatique": "#48c9b0", "Natif": "#2e4053", "Autre": "#f4d03f"
        };
        const backgroundColors = [];

        racesList.forEach(race => backgroundColors.push(raceColors[race]));

        return backgroundColors;
    }

    static readFiltersValues() {
        if (document.getElementById("ToutArme").checked === true) {
            MapPlotter.armed = 0;
        } else if (document.getElementById("Arme").checked === true) {
            MapPlotter.armed = 1;
        } else if (document.getElementById("NonArme").checked === true) {
            MapPlotter.armed = 2;
        };
        if (document.getElementById("ToutAge").checked === true) {
            MapPlotter.age = 0;
        } else if (document.getElementById("Mineur").checked === true) {
            MapPlotter.age = 1;
        } else if (document.getElementById("Majeur").checked === true) {
            MapPlotter.age = 2;
        };

    }

    static drawRaceDoughnut() {
        /* 
        * Draws a doughnut representing the repartition of shootings across the different
        * races present in the state on the right hand side of the map.
        */

        var ctx = document.getElementById('raceRepartitionChart');
        if (ctx != "") {
            document.getElementById('raceRepartitionChart').innerHTML = "";
        }

        const [labels, data] = dataProcessingUtils.prepDoughnutData(MapPlotter.currentStateName, MapPlotter.age, MapPlotter.armed);
        const backgroundColor = MapPlotter.getBackgroundColors(labels);

        if (MapPlotter.raceDoughnut) {
            // Destroys old doughnut before drawing a new one
            MapPlotter.raceDoughnut.destroy();
        }


        MapPlotter.raceDoughnut = new Chart(ctx, {
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
                    text: MapPlotter.currentStateName,
                }
            }
        });
    }

    static setUpFilteringButtons() {
        const filtersIds = ['ToutArme', 'Arme', 'NonArme', 'ToutAge', 'Mineur', 'Majeur'];
        filtersIds.forEach(id => document.getElementById(id).addEventListener('click', MapPlotter.updateMapDoughnut));
    }

    static updateMapDoughnut() {
        MapPlotter.readFiltersValues();

        MapPlotter.drawRaceDoughnut();
        MapPlotter.updateMapColors();
    }

    static updateMapColors() {
        MapPlotter.readFiltersValues();
        
        MapPlotter.map.removeLayer(MapPlotter.geojson);
        MapPlotter.setupGeoJson(map);
    }

    static getStyle(feature) {
        /* Returns the style of a state on the map */
        var numberOfShootings = 0;

        if (feature.properties) {
            numberOfShootings = dataProcessingUtils.numberOfShootingsInState(feature.properties.name, MapPlotter.age, MapPlotter.armed);
        }

        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: MapPlotter.getMapIntensity(numberOfShootings)
        };
    }

    static highlightFeature(e) {
        /* Event Manager */
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
        MapPlotter.info.update(layer.feature.properties);
    }
        
    static resetHighlight(e) {
        MapPlotter.geojson.resetStyle(e.target);
    }
    
    static zoomToFeature(e) {
        /* Event Manager */
        MapPlotter.currentStateName = e.target.feature.properties.name;
        MapPlotter.drawRaceDoughnut();
    }
    
    static onEachFeature(feature, layer) {
        /* Event Manager */
        layer.on({
            mouseover: MapPlotter.highlightFeature,
            mouseout: MapPlotter.resetHighlight,
            click: MapPlotter.zoomToFeature
        });
    }

    static setupMapControl(){
        /* Setup event manager */
        var info = L.control();
        // creates Dom elements for the layer, add them to map panes
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            const stateName = (props ? props.name : "Texas");

            const numberOfShootings = dataProcessingUtils.numberOfShootingsInState(stateName)

            const info = props ? `<b>${stateName}</b><br />${numberOfShootings} morts` : 'survoler sur un état'
            this._div.innerHTML = '<h4> Le nombre du mort </h4>' + info
        };

        info.addTo(MapPlotter.map);

        MapPlotter.info = info;
    }

    static setupGeoJson() {
        /* Defines the geographic borders of the states */
        var geojson = L.geoJson(statesData, {
            style: MapPlotter.getStyle,
            onEachFeature: MapPlotter.onEachFeature
        });

        geojson.addTo(MapPlotter.map);
        MapPlotter.geojson = geojson;
    }

    static setupLegend() {
        /* Add a legend to the map */
        var legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function (map) {
        
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [10, 20, 50, 100, 200, 350, 700],
                labels = [],
                from, to;
        
            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];
        
                labels.push(
                    `<i style="background:${MapPlotter.getMapIntensity(from + 1)}"></i>
                    ${from} ${to ? '&ndash;' + to : '+'}`
                )
            }
        
            div.innerHTML = labels.join('<br>');
            return div;
        };
        
        legend.addTo(MapPlotter.map);
    }

    static drawMap() {
        MapPlotter.map = L.map('map').setView([37.8, -96], 4);
        L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=i8upOzPaFmUXM0tH6yA4',
            {
                maxZoom: 18,
                attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
                tileSize: 512,
                zoomOffset: -1
            }).addTo(MapPlotter.map);


        MapPlotter.setupMapControl();
        MapPlotter.setupGeoJson();
        MapPlotter.setupLegend();
        
        MapPlotter.map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');
    }
}

new MapPlotter().render();
