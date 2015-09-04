$(document).ready(function() {
  initialize();
});

function initialize() {
  var map = initMap();

  markAllPointsOnMap(map);
  updateTable(getSiteData());
  updatePagination(10);
}

function markAllPointsOnMap(map) {
  var markers = [];
  $.get("/api/points", function(points) {
    _.forEach(points, function(point) {
      var marker = { name:"Site",
        longitude:point.position.longitude,
        latitude:point.position.latitude,
        type:point.technology,
        operator:point.operator
      };
      var createdMarker = createMarker(map,marker);
      markers.push(createdMarker);
    });
    var markerCluster = new MarkerClusterer(map, markers);
  });
}

function initMap() {
  var mapProp = {
    center:new google.maps.LatLng(13,122),
    zoom:6,
    disableDefaultUI: true,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  return map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

// TODO: Send GET query for site data
function getSiteData()
{
  var site = [
    {name:"Site 1", longitude:14.58, latitude:121.00, technology:"LTE", type:"Flexi", operator:"Globe"},
    {name:"Site 2", longitude:14.63, latitude:121.03, technology:"3G", type:"Flexi", operator:"Smart"}
  ];
  return site;
}

function createMarker(map,site) {
  var coordinates = getSitePosition(site);
  var marker = new google.maps.Marker(
    {
      position:coordinates,
      title:site.name,
      icon:"siteIcon.png",
      map: map
    }
  );
  marker.addListener('click', function() { showSiteData(marker,site) } );
  return marker;
}

function getSitePosition(site) {
  return new google.maps.LatLng(site.latitude,site.longitude);
}

function showSiteData(marker,site) {
  var siteDetails = "";
  for (x in site) {
    siteDetails += x + ": " + site[x] + "<br/>";
  }
  var infoWindow = new google.maps.InfoWindow(
    {
      content:siteDetails
    }
  );
  var map = marker.getMap();
  map.setZoom(15);
  map.setCenter(marker.getPosition());
  infoWindow.open(map,marker);
}

function updateTable(siteData) {
  $("#maps table tbody").empty();
  var tableData = "";
  for (i = 0; i < siteData.length; i++) {
    var site = siteData[i];
    tableData = "<tr data-longitude=\"" + site.longitude + "\" data-latitude=\"" + site.latitude + "\">"
      + "<td>" + site.name + "</td>"
      + "<td>" + site.technology + "</td>"
      + "<td>" + site.type + "</td>"
      + "<td>" + site.operator + "</td>"
      + "</tr>";
      $("#maps table").append(tableData);
  }
}

function updatePagination(pages) {
  var pagination = $("#maps ul");
  pagination.empty();
  for( i = 0; i < pages; i++) {
    pagination.append("<li><a href=\"#\"" + (i+1) + "</a></li>");
  }
}
