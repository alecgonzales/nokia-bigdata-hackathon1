
google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  var map = initMap();

  addMarker(map,loadMapData("manila"));
  addMarker(map,loadMapData("qc"));
}

function initMap() {
  var mapProp = {
    center:new google.maps.LatLng(13,122),
    zoom:6,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  return map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

function loadMapData(name) {
  if (name === "manila")
  {
    return new google.maps.LatLng(14.58,121.00);
  }
  else if (name === "qc")
  {
    return new google.maps.LatLng(14.63,121.03);
  }
  else {
    return null;
  }
}

function addMarker(map,position) {
  var marker = new google.maps.Marker(
    {
      position:position,
    }
  );
  marker.setMap(map);
}
