import dataProcessingUtils from '../dataTreatment/dataProcessingUtils';
import statesData from '../dataTreatment/us-states';

class Map {
    /*
    * Draws a USA map with the number of shootings in each state, When a state is clicked,
    * displays a doughnut containing the shootings repartition per state
    */

    render() {
        this.drawMap();
        Map.drawRaceDoughnut("Texas");
    }

    static getMapIntensity(numberOfShootings) {
        /* Returns the corresponding intensity color to the number of shootings */
        return numberOfShootings > 700 ? '#800026' :
            numberOfShootings > 350 ? '#BD0026' :
                numberOfShootings > 200 ? '#E31A1C' :
                    numberOfShootings > 100 ? '#FC4E2A' :
                        numberOfShootings > 50 ? '#FD8D3C' :
                            numberOfShootings > 20 ? '#FEB24C' :
                                numberOfShootings > 10 ? '#FED976' :
                                    '#FFEDA0';
    }

    static getBackgrounColors(racesList) {
        /* Takes an array of races and output their corresponding background color */

        const raceColors = {
            "Blanc": "#5b2c6f", "Noir": "#d35400", "Hispanique": "#5499c7 ",
            "Asiatique": "#48c9b0", "Natif": "#2e4053", "Autre": "#f4d03f"
        };
        const backgroundColors = [];

        racesList.forEach(race => backgroundColors.push(raceColors[race]));

        return backgroundColors;
    }

    static getStyle(feature) {

        /* Returns the style of a state */

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
            fillColor: Map.getMapIntensity(numberOfShootings)
        };
    }

    static drawRaceDoughnut(stateName) {
        /* Draws a doughnut representing the repartition of shootings across the different
        * races present in the state
        */

        //check
        if (document.getElementById("ToutArme").checked === true) {
            //exemple//
            armed = 0;
        } else if (document.getElementById("Arme").checked === true) {
            armed = 1;
        } else if (document.getElementById("nonArme").checked === true) {
            armed = 2;
        };
        if (document.getElementById("Toutage").checked === true) {
            aage = 0;
        } else if (document.getElementById("Mineur").checked === true) {
            age = 1;
        } else if (document.getElementById("Majeur").checked === true) {
            age = 2;
        };

        var ctx = document.getElementById('raceRepartitionChart');
        if (ctx != "") {
            document.getElementById('raceRepartitionChart').innerHTML = "";
        }

        const [labels, data] = dataProcessingUtils.prepDoughnutData(stateName);
        const backgroundColor = Map.getBackgrounColors(labels);

        if (Map.raceDoughnut) {
            // Destroys old doughnut before drawing a new one
            Map.raceDoughnut.destroy();
        }

        Map.raceDoughnut = new Chart(ctx, {
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
                }
            }
        });
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
        Map.info.update(layer.feature.properties);
    }
        
    static resetHighlight(e) {
        Map.geojson.resetStyle(e.target);
    }
    
    static zoomToFeature(e) {
        /* Event Manager */
        var layer = e.target;
        Map.drawRaceDoughnut(layer.feature.properties.name);
    }
    
    static onEachFeature(feature, layer) {
        /* Event Manager */
        layer.on({
            mouseover: Map.highlightFeature,
            mouseout: Map.resetHighlight,
            click: Map.zoomToFeature
        });
    }

    static geojson = L.geoJson(statesData, {
        style: Map.getStyle,
        onEachFeature: Map.onEachFeature
    });

    static info = L.control();

    drawMap() {

        var map = L.map('map').setView([37.8, -96], 4);
        L.tileLayer('https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=i8upOzPaFmUXM0tH6yA4',
            {
                maxZoom: 18,
                attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
                tileSize: 512,
                zoomOffset: -1
            }).addTo(map);


        // creates Dom elements for the layer, add them to map panes
        Map.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        Map.info.update = function (props) {
            const stateName = (props ? props.name : "Texas");

            const numberOfShootings = dataProcessingUtils.numberOfShootingsInState(stateName)

            const info = props ? `<b>${stateName}</b><br />${numberOfShootings} morts` : 'survoler sur un état'
            this._div.innerHTML = '<h4> Le nombre du mort </h4>' + info
        };

        Map.info.addTo(map);
        Map.geojson.addTo(map);
        
        map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');
        
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
                    `<i style="background:${Map.getMapIntensity(from + 1)}"></i>
                    ${from} ${to ? '&ndash;' + to : '+'}`
                )
            }
        
            div.innerHTML = labels.join('<br>');
            return div;
        };
        
        legend.addTo(map);
    }
}

new Map().render();