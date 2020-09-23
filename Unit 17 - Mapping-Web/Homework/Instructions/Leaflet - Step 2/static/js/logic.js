
const apiKey = API_KEY

const grayMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.mapbox.com/">MapBox</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 18,
  id: 'mapbox/light-v10',
  accessToken: apiKey
})

const satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.mapbox.com/">MapBox</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 18,
  id: 'mapbox/satellite-streets-v11',
  accessToken: apiKey
})

const outdoorsMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.mapbox.com/">MapBox</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 18,
  id: 'mapbox/outdoors-v11',
  accessToken: apiKey
})

// created layers
const map = L.map('map', {
  center: [
    51.505, -0.09
  ],
  zoom: 3,
  layers: [grayMap, satelliteMap, outdoorsMap]
})

// add map
grayMap.addTo(map)

// create two sets of data
const tectonicplates = new L.LayerGroup()
const earthquakes = new L.LayerGroup()

// defining map choices
const baseMaps = {
  Satellite: satelliteMap,
  Grayscale: grayMap,
  Outdoors: outdoorsMap
}

// define overlays
const overlays = {
  'Tectonic Plates': tectonicplates,
  Earthquakes: earthquakes
}

// add control
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map)

// get geoJSON data
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson', function(data) {
  
  // add a GeoJSON layer
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng)
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup('Magnitude: ' + feature.properties.mag + '<br>Location: ' + feature.properties.place)
    }
  }).addTo(earthquakes)

  // add earthquake layer
  earthquakes.addTo(map)

  // create legend
  const legend = L.control({
    position: 'bottomright'
  })

  // add legend
  legend.onAdd = function() {
    const div = L
      .DomUtil
      .create('div', 'info legend')

    const grades = [0, 1, 2, 3, 4, 5]
    const colors = [
      '#98ee00',
      '#d4ee00',
      '#eecc00',
      '#ee9c00',
      '#ea822c',
      '#ea2c2c'
    ]

    // get colored square
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += '<i style="background: ' + colors[i] + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
    }
    return div
  }

  // add legend
  legend.addTo(map)

  // get Tectonic Plate geoJSON data
  d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json',
    function(platedata) {
      L.geoJson(platedata, {
        color: 'orange',
        weight: 2
      })
      .addTo(tectonicplates)

      tectonicplates.addTo(map)
    }
  )
  
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: '#000',
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    }
  }

  // set marker color
  function getColor(magnitude) {
    switch (true) {
    case magnitude > 5:
      return '#ea2c2c'
    case magnitude > 4:
      return '#ea822c'
    case magnitude > 3:
      return '#ee9c00'
    case magnitude > 2:
      return '#eecc00'
    case magnitude > 1:
      return '#d4ee00'
    default:
      return '#98ee00'
    }
  }

  // set radius
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1
    }

    return magnitude * 4
  }
})
