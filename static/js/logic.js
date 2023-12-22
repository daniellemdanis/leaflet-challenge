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
d3.json(url).then(function (response) {

    features = response.features;

    function getColor(depth) {
        if (depth <= 5) {
            return 'green';
        } else if (depth <= 10) {
            return 'yellow';
        } else {
            return 'red';
        }
    }

    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 5, 10],
            labels = [];

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    let info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Earthquake Info</h4>' + (props ?
            '<b>Magnitude:</b>' + props.magnitude.toFixed(2) + '<br />' + '<b>Depth:</b>' + props.depth.toFixed(2) + ' km'
            : 'Hover over an earthquake');
    };

    function highlightFeature(e) {
        let layer = e.target;

        layer.setStyle({
            weight: 2,
            dashArray: '',
            fillOpacity: 0.75
        });

        layer.bringToFront();

        let props = {
            magnitude: layer.options.radius / 15000,
            depth: layer.getLatLng().lat
        };

        info.update(props);
    }

    function resetHighlight(e) {
        let layer = e.target;

        layer.setStyle({
            weight: 0.5,
            fillOpacity: .75
        });

        info.update();
    }

    legend.addTo(myMap);
    info.addTo(myMap);

    for (let i = 0; i < features.length; i++) {
        let location = features[i].geometry;
        let magnitude = features[i].properties;
        let depth = location.coordinates[2];

        let circleMarker = L.circle([location.coordinates[1], location.coordinates[0]], {
            stroke: false,
            fillOpacity: .75,
            color: getColor(depth),
            radius: (magnitude.mag) * 15000
        });

        circleMarker.on('mouseover', highlightFeature);
        circleMarker.on('mouseout', resetHighlight);

        earthquake_markers.push(circleMarker);
    }

    let quakes = L.layerGroup(earthquake_markers);

    // Add the earthquake markers layer to the map
    quakes.addTo(myMap);
});
