$(document).ready(function() {
  initialize();
});

var appData = {
  map:null,
  markers:[],
  lastSelected:null,
  currentPage:1,
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
  bindSidebarEvents()
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
  marker.addListener('click', function()
    {
      setSelected(marker);
      $( ".table tbody tr" ).siblings().removeClass('selected');
    });
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
      appData.lastSelected.infoWindow.close();
      appData.lastSelected.setIcon("siteicon.png");
    }
  }
  selected.setAnimation(google.maps.Animation.BOUNCE);
  selected.infoWindow.open(appData.map,selected);
  selected.setIcon("pikachu.png");
  appData.lastSelected = selected;
  appData.map.setCenter(selected.getPosition());
}

function queryTableData(page,key,value) {
  $.get(["/api/points",page,key,value].join("/"), function(points) {
    updateTable(points);
    updatePagination();
  });
}

function updateTable(sites) {
  $("#maps table tbody").empty();
  var index = (appData.currentPage - 1) * 50;
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

function updatePagination() {
  var pagination = $(".pagination");
  pagination.empty();
  if (appData.markers.length > 0)
  {
    var pages = Math.ceil(appData.markers.length / 50);
    if (appData.currentPage !== 1) {
      pagination.append("<li><a href='#'>&#60;&#60;</a></li>");
      pagination.append("<li><a href='#'>&#60;</a></li>");
    }
    appendCurrentAndNearbyPages(pagination,pages);
    if (appData.currentPage !== pages) {
      pagination.append("<li><a href='#'>&#62;</a></li>");
      pagination.append("<li><a href='#'>&#62;&#62;</a></li>");
    }
    $( ".pagination li" ).on( "click", function() {
      var text = $(this).text();
      if (text == "<<") {
        appData.currentPage = 1;
      }
      else if (text == "<") {
        appData.currentPage--;
      }
      else if (text == ">") {
        appData.currentPage++;
      }
      else if (text == ">>") {
        appData.currentPage = pages;
      }
      else {
        appData.currentPage = parseInt(text);
      }
      var key = $('#search-key li.selected').attr('id') || 'null'
      var value = $('#search-value').val() || 'null'
      queryTableData(appData.currentPage,key,value);
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

function addTableClickEvent(element) {
  $( ".table tbody tr" ).on( "click", function( event ) {
    $(this).addClass('selected').siblings().removeClass('selected');
    var index = $(this).data("index")
    var marker = appData.markers[index];
    setSelected(marker);
    appData.map.setZoom(30);
  });
};

sidebarFunctions: {
  function bindSidebarEvents() {
    bindInputSearchEvent()
    bindDropdownEvent()
    bindSidebarLockEvent()
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
      appData.currentPage = 1;
      synchronizeMapPointsWithTable()
    })
  }

  function bindSidebarLockEvent() {
    $('#pin-sidebar').click(function() {
      $('.sidebar').toggleClass('pinned');
    });
  }
}
