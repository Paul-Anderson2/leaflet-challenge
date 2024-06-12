//store the URL for the GeoJSON data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson';

// create Leaflet tile layer.
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create Leaflet map object.
var myMap = L.map("map", {
    center: [37.00, -95.00],
    zoom: 5,
    layers: [streets]
});


//define basemaps as the streetmap
let baseMaps = {
    "streets": streets
};

//define the earthquake layergroup and tectonic plate layergroups for the map
let earthquake_data = new L.LayerGroup();
let tectonics = new L.LayerGroup();

//define the overlays and link the layergroups to separate overlays
let overlays = {
    "Earthquakes": earthquake_data,
    "Tectonic Plates": tectonics
};

//add a control layer and pass in baseMaps and overlays
L.control.layers(baseMaps, overlays).addTo(myMap);

//function for the style of the points
function styleInfo(feature) {
    return {
        color: chooseColor(feature.geometry.coordinates[2]), // set outside color by depth
        radius: chooseRadius(feature.properties.mag), //sets radius based on magnitude 
        fillColor: chooseColor(feature.geometry.coordinates[2]) //sets fillColor based on the depth of the earthquake
    }
};

//function to choose the color of the points depending on depth
// chose to scale from blue to red as depth increases
function chooseColor(depth) {
    if (depth <= 10) return "green";
    else if (depth > 10 & depth <= 30) return "blue";
    else if (depth > 30 & depth <= 50) return "yellow";
    else if (depth > 50 & depth <= 70) return "pink";
    else if (depth > 70 & depth <= 90) return "orange";
    else return "red";
};

//define a function to determine the radius of each earthquake marker by the magnitude of the quake
// Just using the magitude made the differences too small. Settled on magnitude *4 after experimentation
function chooseRadius(magnitude) {
    return magnitude*4;
};


//defining popup when markers are clicked
// Popups yields Earthquake ID, Magnitude, Location, and depth of each earthquake taken from json data
d3.json(url).then(function (data) { //pull the earthquake JSON data with d3
    L.geoJson(data, {
        pointToLayer: function (feature, latlon) {  //declare a point to layer function that takes a feature and latlon
            return L.circleMarker(latlon).bindPopup("<h3> ID : " + feature.id + "<h3> Magnitude : " +feature.properties.mag + "<h3> Location :" + feature.properties.place + "<h3> Depth (km): " + feature.geometry.coordinates[2]); 
        },
        style: styleInfo //call the style function we defined above
    }).addTo(earthquake_data); // pull the earthquake data
    earthquake_data.addTo(myMap);

    //pull and trace the tectonic plates
    //add tectonic data to the tectonic layer
    // attribution to : https://github.com/fraxen/tectonicplates for the tectonic plate info
    // pull data using d3
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (data) { 
        L.geoJson(data, {
            color: "black", 
            weight: 3
        }).addTo(tectonics);
        tectonics.addTo(myMap);
    });


});
//create legend - credit to codepen, attribution below
// Attribution to https://codepen.io/haakseth/pen/KQbjdO -- this structure is referenced in style.css
var legend = L.control({ position: "bottomright" });
legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "legend");
       div.innerHTML += "<h4>Depth (km)</h4>";
       div.innerHTML += '<i style="background: green"></i><span>(< 10)</span><br>';
       div.innerHTML += '<i style="background: blue"></i><span>(10 - 30)</span><br>';
       div.innerHTML += '<i style="background: yellow"></i><span>(30 - 50)</span><br>';
       div.innerHTML += '<i style="background: pink"></i><span>(50 - 70)</span><br>';
       div.innerHTML += '<i style="background: orange"></i><span>(70 - 90)</span><br>';
       div.innerHTML += '<i style="background: red"></i><span>( > 90)</span><br>';
  
    return div;
  };
  //add the legend to the map
  legend.addTo(myMap);

