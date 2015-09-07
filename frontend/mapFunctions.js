$(document).ready(function() {
  initialize();
});

var appData = {
  map:null,
  markers:[],
  lastSelected:null,
}

function initialize() {
  initMap(appData);
  markAllPointsOnMap(appData);
  queryTableData();
  updatePagination(10);
  addTableClickEvent();
  addTableHoverEvent()
}

function initMap() {
  var mapProp = {
    center:new google.maps.LatLng(13,122),
    zoom:6,
    disableDefaultUI: true,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  };
  appData.map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

function markAllPointsOnMap() {
  clearAllMarkers();
  $.get("/api/points", function(points) {
    _.forEach(points, function(point) {
      var marker = { name:point.site_id,
        longitude:point.position.longitude,
        latitude:point.position.latitude,
        type:point.technology,
        operator:point.operator
      };
      var createdMarker = createMarker(appData.map,marker);
      appData.markers.push(createdMarker);
    });
    var markerCluster = new MarkerClusterer(appData.map,appData.markers);
  });
}

function clearAllMarkers(){
  appData.markers = [];
}

function createMarker(map,site) {
  var marker = new google.maps.Marker(
    {
      position:new google.maps.LatLng(site.latitude,site.longitude),
      title:site.name,
      icon:"siteIcon.png",
      map:map,
      infoWindow:createInfoWindow(site),
    }
  );
  marker.addListener('click', function() { setSelected(marker) } );
  return marker;
}

function createInfoWindow(site) {
  var infoWindow = new google.maps.InfoWindow(
    {
      content:getSiteDetails(site)
    }
  );
  return infoWindow;
}

function getSiteDetails(site) {
  var siteDetails = "";
  for (x in site) {
    siteDetails += x + ": " + site[x] + "<br/>";
  }
  return siteDetails;
}

function setSelected(selected) {
  if (appData.lastSelected != null) {
    if (appData.lastSelected === selected) {
      return;
    }
    else {
      appData.lastSelected.setAnimation(null);
      appData.lastSelected.setIcon("siteicon.png");
    }
  }
  appData.map.setCenter(selected.getPosition());
  selected.infoWindow.open(appData.map,selected);
  //selected.setIcon("pikachu.png");
  selected.setAnimation(google.maps.Animation.BOUNCE);
  appData.lastSelected = selected;
}

function queryTableData(page,key,value) {
  page = page || 1;
  key = key || 'null';
  value = value || 'null';

  console.log(  );
  $.get(["/api/points",page,key,value].join("/"), function(points) {
    updateTable(points);
  });
}

function updateTable(sites) {
  $("#maps table tbody").empty();
  var index = 0;
  _.forEach(sites, function(site) {
    var tableData = "<tr data-index='" + index++ + "'>"
      + "<td>" + site.site_id + "</td>"
      + "<td>" + site.operator + "</td>"
      + "<td>" + site.technology + "</td>"
      + "<td>" + site.site_type + "</td>"
      + "</tr>";
    $("#maps table").append(tableData);
    addTableClickEvent();
    addTableHoverEvent()
  });
}

function updatePagination(pages) {
  var pagination = $("#maps .pagination");
  pagination.empty();
  for( i = 0; i < pages; i++) {
    pagination.append("<li><a>" + (i+1) + "</a></li>");
  }
}

function addTableClickEvent() {
  $( ".table tbody tr" ).on( "click", function( event ) {
    $(this).addClass('selected').siblings().removeClass('selected');
    var index = $(this).data("index")
    var marker = appData.markers[index];
    setSelected(marker);
    //marker.setIcon("pikachu.png");
    appData.map.setZoom(30);
  });
};

function addTableHoverEvent() {
  $( ".table tbody tr" ).hover(function() {
    $(this).addClass('highlight').siblings().removeClass('highlight');
  });
};