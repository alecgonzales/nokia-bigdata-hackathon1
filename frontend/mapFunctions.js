$(document).ready(function() {
  initialize();
});

var appData = {
  map:null,
  markers:[],
  lastSelected:null,
  markerCluster:null,
  clearOverlays: function() {
    _.forEach(this.markers, function(marker) {
      marker.setMap(null)
    })
    this.markers.length = 0
    if (appData.markerCluster) {
      appData.markerCluster.clearMarkers()
    }
  }
}

function initialize() {
  initMap()
  synchronizeMapPointsWithTable()
  bindSearchEvents()
  updatePagination(10)
}

function synchronizeMapPointsWithTable() {
  var page = page || 1
  var key = $('#search-key li.selected').attr('id') || 'null'
  var value = $('#search-value').val() || 'null'

  markAllPointsOnMap(["/api/points","0",key,value].join("/"))
  queryTableData(page,key,value)
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

function markAllPointsOnMap(url) {
  appData.clearOverlays();
  $.get(url, function(points) {
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
    appData.markerCluster = new MarkerClusterer(appData.map,appData.markers);
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
      appData.lastSelected.setIcon("siteicon.png");
      appData.lastSelected.infoWindow.close();
    }
  }
  appData.map.setCenter(selected.getPosition());
  selected.infoWindow.open(appData.map,selected);
  //selected.setIcon("pikachu.png");
  selected.setAnimation(google.maps.Animation.BOUNCE);
  appData.lastSelected = selected;
}

function queryTableData(page,key,value) {
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
  });
  addTableClickEvent();
}

function updatePagination(pages) {
  var pagination = $("#maps .pagination");
  pagination.empty();
  for( i = 0; i < pages; i++) {
    pagination.append("<li><a>" + (i+1) + "</a></li>");
  }
}

function addTableClickEvent(element) {
  $( ".table tbody tr" ).on( "click", function( event ) {
    $(this).addClass('selected').siblings().removeClass('selected');
    var index = $(this).data("index")
    var marker = appData.markers[index];
    setSelected(marker);
    //marker.setIcon("pikachu.png");
    appData.map.setZoom(30);
  });
};

siteSearch: {
  function bindSearchEvents() {
    bindInputSearchEvent()
    bindDropdownEvent()
  }

  function bindInputSearchEvent() {
    var typingTimer;
    var triggerInterval = 1000;
    var searchBar = $('input#search-value')

    searchBar.on('keyup', function() {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function() {
        synchronizeMapPointsWithTable()
      }, triggerInterval);
    });

    searchBar.on('keydown', function() {
      clearTimeout(typingTimer);
    });
  }

  function bindDropdownEvent() {
    $('#search-key li').click( function() {
      $('#search-key li').each( function() {
        $(this).removeClass('selected')
      })
      $(this).addClass('selected')
      synchronizeMapPointsWithTable()
    })
  }
}
