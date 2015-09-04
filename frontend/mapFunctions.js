$(document).ready(function() {
  initialize();
});

function initialize() {
  var map = initMap();

  markAllPointsOnMap(map);
  queryTableData();
}

function markAllPointsOnMap(map) {
  $.get("/api/points", function(points) {
    _.forEach(points, function(point) {
      var marker = { name:point.site_id,
        longitude:point.position.longitude,
        latitude:point.position.latitude,
        type:point.technology,
        operator:point.operator
      };
      addMarker(map,marker);
    });
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

function addMarker(map,site) {
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
  map.setZoom(10);
  map.setCenter(marker.getPosition());
  infoWindow.open(map,marker);
}

function queryTableData(page,key,value) {
  page = page || 1;
  key = key || 'null';
  value = value || 'null';

  console.log("/api/points/" + page + '/'+ key + '/' + value);
  $.get("/api/points/" + page + '/'+ key + '/' + value, function(points) {
    console.log(points);
    updateTable(points);
  });
}

function updateTable(sites) {
  $("#maps table tbody").empty();
  _.forEach(sites, function(site) {
    var tableData = "<tr data-longitude=\"" + site.longitude + "\" data-latitude=\"" + site.latitude + "\">"
      + "<td>" + site.site_name + "</td>"
      + "<td>" + site.technology + "</td>"
      + "<td>" + site.site_type + "</td>"
      + "<td>" + site.operator + "</td>"
      + "</tr>";
    $("#maps table").append(tableData);
  });
}
