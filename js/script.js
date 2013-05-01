
$(document).ready(function(){

    var map = L.map('map');//.setView([38.5, -96.9], 4);
    L.tileLayer('http://{s}.tile.cloudmade.com/1c3152432f41488e892c6ddc7839917a/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18,
        minZoom: 2,
        detectRetina: true
    }).addTo(map);

    $.getJSON('/location.json', function(data) {
        var lat = data['lat'];
        var lon = data['lon'];
        if (isNaN(lat) || isNaN(lon)) return;
        var latLng = [lat, lon];

        map.setView(latLng, 15);

        var currentLocMarker = L.marker(latLng).addTo(map);

        var popupString = "<em>" + $.timeago(data['timestamp']) + "</em>";
        if (data['speed'] > 2) {
            var speedString = data['speed'] + " " + data["speed_unit"];
            var direction = compassbox(data["heading"]);
            popupString = "moving <strong>" + speedString + "</strong> " + direction + "<br />" + popupString;
        }
        currentLocMarker.bindPopup(popupString).openPopup();
    });

    var gmtOffsetForLastFmScript = new Date().getTimezoneOffset()/60*-1;
	lastFmRecords.init({
		username: 'cdrom600',
		placeholder: 'stream-lastfm',
		defaultthumb: '/record_lp.jpg',
		period: 'recenttracks', // recenttracks, 7day, 3month, 6month, 12month, overall, topalbums, or lovedtracks
		count: 32,
		refresh: 3,
		offset: gmtOffsetForLastFmScript
    });

    $('#foursquare-container').FeedEk({
        FeedUrl: 'https://feeds.foursquare.com/history/RBLD5NMIHX2KNUDT0WK2A4B3CCB0QPYM.rss',
        MaxCount: 12,
        ShowDesc: false,
        ShowPubDate: true,
    });

	var konami = new Konami();
	konami.code = function() {
		$.getScript('http://www.cornify.com/js/cornify.js', function(){
			for (i=0; i<12; ++i) cornify_add();
		});
	};
	konami.load();

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
