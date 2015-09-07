$(document).ready(function() {
  initialize();
});

var appData = {
  map:null,
  markers:[],
  lastSelected:null,
  itemsInTable:0,
  currentPage:1,
}

function initialize() {
  initMap();
  markAllPointsOnMap();
  queryTableData();
  addTableClickEvent();
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
    updatePagination();
  });
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
    }
  }
  appData.map.setCenter(selected.getPosition());
  selected.infoWindow.open(appData.map,selected);
  selected.setAnimation(google.maps.Animation.BOUNCE);
  appData.lastSelected = selected;
}

function queryTableData(page,key,value) {
  page = page || 1;
  key = key || 'null';
  value = value || 'null';

  $.get(["/api/points",page,key,value].join("/"), function(points) {
    appData.itemsInTable = points.length;
    updateTable(points);
    updatePagination();
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
  });
}

function updatePagination() {
  if ( (appData.markers.length > 0) && (appData.itemsInTable > 0) )
  {
    var pages = Math.ceil(appData.markers.length / 50);
    var pagination = $(".pagination");
    pagination.empty();
    if (pages > 0)
    {
      if (appData.currentPage !== 1) {
        pagination.append("<li><a href='#'>&#60;&#60;</a></li>");
        pagination.append("<li><a href='#'>&#60;</a></li>");
      }
      appendCurrentAndNearbyPages(pagination,pages);
      if (appData.currentPage !== pages) {
        pagination.append("<li><a href='#'>&#62;</a></li>");
        pagination.append("<li><a href='#'>&#62;&#62;</a></li>");
      }
    }
    $( ".pagination li" ).on( "click", function() {
      var text = $(this).text();
      if (text == "<<") {
        appData.currentPage = 1;
      }
      else if ((text == "<") && (appData.currentPage > 1)) {
        appData.currentPage--;
      }
      else if ((text == ">") && (appData.currentPage < (pages-1))) {
        appData.currentPage++;
      }
      else if (text == ">>") {
        appData.currentPage = pages;
      }
      else {
        appData.currentPage = parseInt(text);
      }
      queryTableData(appData.currentPage);
    });
  }
}

function appendCurrentAndNearbyPages(pagination,pages) {
  var pagesToShow = getPagesToShow(pages);
  for (i = 0; i < pagesToShow.length; i++) {
    if (pagesToShow[i] === appData.currentPage) {
      pagination.append("<li><a href='#' id='currentPage'>" + pagesToShow[i] + "</a></li>");
    }
    else {
      pagination.append("<li><a href='#'>" + pagesToShow[i] + "</a></li>");
    }
  }
}

function getPagesToShow(pages) {
  var nearbyPages = [];
  var pagesToShow = [];
  for (i = -4; i < 5; i++) {
    nearbyPages.push(appData.currentPage+i);
  }
  for (i = 0; i < nearbyPages.length; i++) {
    if ((nearbyPages[i] > 0) && (nearbyPages[i] <= pages)) {
      pagesToShow.push(nearbyPages[i]);
    }
  }
  return pagesToShow;
}

function addTableClickEvent() {
  $( ".table tbody tr" ).on( "click", function( event ) {
    var index = $(this).data("index")
    var marker = appData.markers[index];
    setSelected(marker);
    // marker.setIcon("pikachu.png");
    appData.map.setZoom(30);
  });
};
