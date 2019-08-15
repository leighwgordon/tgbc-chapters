function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/chapters.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

function initbaselayer(map) {
    var osmUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osmAttrib='Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 0,
        maxZoom: 19,
        noWrap: true,
        attribution: osmAttrib
    });
    map.addLayer(osm);
}

function initchapterslayer(map) {
    loadJSON(function(response) {
        var chapterFeatures = JSON.parse(response);
        console.log(chapterFeatures)
        var geojsonLayer = L.geoJSON(chapterFeatures, {
            onEachFeature: onEachFeature,
            pointToLayer: function (feature, latlng) {
                var tgbcIcon = L.icon({
                    iconUrl: 'img/tgbc-icon.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, 0]
                });
                return L.marker(latlng, {icon: tgbcIcon});
            }
        }).addTo(map);
        map.fitBounds(geojsonLayer.getBounds().pad(0.02));
    });
}

function initlayers() {
    var map = new L.Map('map');
    initbaselayer(map);
    initchapterslayer(map);
}
