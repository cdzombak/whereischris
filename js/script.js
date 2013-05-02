$(document).ready(function(){

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
