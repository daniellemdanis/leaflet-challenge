let myMap = L.map("map", {
    center: [37.09024, -95.712891],
    zoom: 5
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

let earthquake_markers = [];

let url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Get the data with d3.
d3.json(url).then(function(response) {

    features = response.features;

    function getColor(depth) {
        if (depth <=  5) {
            return .25;
        }
        else if (depth <= 10) {
            return .5;
        }
        else {
            return .75
        }
    }

    for (let i = 0; i < features.length; i++) {
        let location = features[i].geometry;
        let magnitude = features[i].properties;
        let depth = location.coordinates[2];

        earthquake_markers.push(
            L.circle([location.coordinates[1], location.coordinates[0]], {
                stroke: false,
                fillOpacity: getColor(depth),
                color: 'red',
                radius: (magnitude.mag)*10000
            })
        );
    }

    let quakes = L.layerGroup(earthquake_markers);

    // Add the earthquake markers layer to the map
    quakes.addTo(myMap);

});
