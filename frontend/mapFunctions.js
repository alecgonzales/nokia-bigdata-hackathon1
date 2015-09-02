
google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {
  var map = initMap();

  var siteData = getSiteData();
  for (i = 0; i < siteData.length; i++) {
    addMarker(map,siteData[i]);
  }
}

function initMap() {
  var mapProp = {
    center:new google.maps.LatLng(13,122),
    zoom:6,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  return map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

// TODO: Send GET query for site data
function getSiteData()
{
  var site = [
    {name:"Site 1", longitude:14.58, latitude:121.00, type:"LTE", operator:"Globe"},
    {name:"Site 2", longitude:14.63, latitude:121.03, type:"3G", operator:"Smart"}
  ];
  return site;
}

function addMarker(map,site) {
  var coordinates = new google.maps.LatLng(site.longitude,site.latitude);
  var marker = new google.maps.Marker(
    {
      position:coordinates,
      title:site.name,
      icon:"siteIcon.png",
    }
  );
  marker.setMap(map);
  marker.addListener('click', function() { showSiteData(marker,site) } );
}

function showSiteData(marker,site) {
  var siteDetails = "";
  for (x in site) {
    siteDetails += site[x] + "<br/>";
  }
  var infoWindow = new google.maps.InfoWindow(
    {
      content:siteDetails
    }
  );
  var map = marker.getMap();
  map.setZoom(10);
  map.setCenter(marker.getPosition());
  infoWindow.open(map,marker);
}
