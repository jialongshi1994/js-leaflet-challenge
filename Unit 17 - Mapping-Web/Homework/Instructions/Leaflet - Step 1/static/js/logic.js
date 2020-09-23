
const apiKey = API_KEY

const streetsMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.mapbox.com/">MapBox</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  accessToken: apiKey
})

// create the map
const map = L.map('map', {
  center: [
    51.505, -0.09
  ],
  zoom: 3
})

// add map
streetsMap.addTo(map)

// get earthquake geoJSON
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson', function(data) {
  
  // add a GeoJSON layer to the map
  L.geoJson(data, {    
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng)
    },    
    style: styleInfo,    
    onEachFeature: function(feature, layer) {
      layer.bindPopup('Magnitude: ' + feature.properties.mag + '<br>Location: ' + feature.properties.place)
    }
  }).addTo(map)

  // create a legend control
  const legend = L.control({
    position: 'bottomright'
  })

  // add legend
  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'info legend')

    const grades = [0, 1, 2, 3, 4, 5]
    const colors = [
      '#98ee00',
      '#d4ee00',
      '#eecc00',
      '#ee9c00',
      '#ea822c',
      '#ea2c2c'
    ]

    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background: ' + colors[i] + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
    }
    return div
  }

  // legend to the map
  legend.addTo(map)
  
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
