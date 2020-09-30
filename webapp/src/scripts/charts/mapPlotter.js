import dataProcessingUtils from '../dataTreatment/dataProcessingUtils';
import statesGeoData from '../dataTreatment/us-states';

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

    static getStateColor(numberOfShootings) {
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
            "Blanc": "#024E82", "Noir": "#8F8F8F", "Hispanique": "#D55E00",
            "Asiatique": "#000000", "Natif": "#56B4E9", "Autre": "#F0E442"
        };
        const backgroundColors = [];

        racesList.forEach(race => backgroundColors.push(raceColors[race]));

        return backgroundColors;
    }

    static readFiltersValues() {
        if (document.getElementById("ToutArme").checked)
            MapPlotter.armed = 0;
        else if (document.getElementById("Arme").checked)
            MapPlotter.armed = 1;
        else if (document.getElementById("NonArme").checked)
            MapPlotter.armed = 2;

        if (document.getElementById("ToutAge").checked)
            MapPlotter.age = 0;
        else if (document.getElementById("Mineur").checked) 
            MapPlotter.age = 1;
        else if (document.getElementById("Majeur").checked)
            MapPlotter.age = 2;
    }

    static drawRaceDoughnut() {
        /* 
        * Draws a doughnut representing the repartition of shootings across the different
        * races present in the state on the right hand side of the map.
        */

       if (MapPlotter.raceDoughnut) 
            // Destroys old doughnut before drawing a new one
            MapPlotter.raceDoughnut.destroy();
    
        const [labels, data] = dataProcessingUtils.prepDoughnutData(
            MapPlotter.currentStateName, MapPlotter.age, MapPlotter.armed
        );
        const backgroundColor = MapPlotter.getBackgroundColors(labels);
        
        const ctx = document.getElementById('raceRepartitionChart');
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
        /* Adds click event listeners for the filtering radio buttons */
        const filtersIds = ['ToutArme', 'Arme', 'NonArme', 'ToutAge', 'Mineur', 'Majeur'];
        filtersIds.forEach(id => document.getElementById(id).addEventListener('click', MapPlotter.updateMapDoughnut));
    }

    static updateMapDoughnut() {
        /* Draws a new doughnut and update state colors*/
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
            numberOfShootings = dataProcessingUtils.numberOfShootingsInState(
                feature.properties.name, MapPlotter.age, MapPlotter.armed
            );
        }

        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: MapPlotter.getStateColor(numberOfShootings)
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
        var geojson = L.geoJson(statesGeoData, {
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
                    `<i style="background:${MapPlotter.getStateColor(from + 1)}"></i>
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
