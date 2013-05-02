$(document).ready(function(){

    var map = L.map('map');//.setView([38.5, -96.9], 4);
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

            if (!userHasMovedMap) map.setView(latLng, 15);

            var currentLocMarker = L.marker(latLng).addTo(map);

            var popupString = "<em>" + $.timeago(data['timestamp']) + "</em>";
            if (data['speed'] > 1) {
                var speedString = data['speed'] + " " + data["speed_unit"];
                var direction = compassbox(data["heading"]);
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

// via: http://rosettacode.org/wiki/Box_the_compass#JavaScript
function compassbox(i) {
    var j = i % 8,
        i = Math.floor(i / 8) % 4,
        cardinal = ['north', 'east', 'south', 'west'],
        pointDesc = ['1', '1 by 2', '1-C', 'C by 1', 'C', 'C by 2', '2-C', '2 by 1'],
        str1, str2, strC;

    str1 = cardinal[i];
    str2 = cardinal[(i + 1) % 4];
    strC = (str1 === 'north' || str1 === 'south') ? str1 + str2 : str2 + str1;
    return pointDesc[j].replace('1', str1).replace('2', str2).replace('C', strC);
}
