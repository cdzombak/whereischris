$(document).ready(function(){

    var map = L.map('map');
    L.tileLayer('http://{s}.tile.cloudmade.com/1c3152432f41488e892c6ddc7839917a/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18,
        minZoom: 2,
        detectRetina: true
    }).addTo(map);

    var userHasMovedMap = false;
    map.on('dragstart', function(e) {
        userHasMovedMap = true;
    });

    var lastTimestamp = "";
    var lastMarker = null;

    var updateMapLocation = function() {
        $.getJSON('/location.json', function(data) {
            if (data['timestamp'] === lastTimestamp) return;
            lastTimestamp = data['timestamp'];

            var lat = data['lat'];
            var lon = data['lon'];
            if (isNaN(lat) || isNaN(lon)) return;
            var latLng = [lat, lon];

            var newZoomLevel = 15; // default zoom level
            if (lastMarker !== null) newZoomLevel = map.getZoom();
            if (!userHasMovedMap) map.setView(latLng, newZoomLevel);

            var currentLocMarker = L.marker(latLng).addTo(map);

            var popupString = "<em>" + $.timeago(data['timestamp']) + "</em>";
            if (data['speed'] > 1) {
                var speedString = data['speed'] + " " + data["speed_unit"];
                var direction = compassbox_en(data["heading"]);
                popupString = "moving <strong>" + speedString + "</strong> " + direction + "<br />" + popupString;
            }
            currentLocMarker.bindPopup(popupString).openPopup();

            if (lastMarker !== null) map.removeLayer(lastMarker);
            lastMarker = currentLocMarker;
        });
    };

    updateMapLocation();
    setInterval(updateMapLocation, 15000);

});

function compassbox_en(heading) {
    var directions = [ "north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest", "north" ];
    return directions[ Math.round(((heading % 360) / 45)) ]
}
