
$(document).ready(function(){
    if ($("#stream-twitter").length) {
		$("#stream-twitter").tweet({
			username: "cdzombak",
			join_text: "",
			count: 20,
			loading_text: "loading...",
			refresh_interval: 400,
			link_user: false
		});
		$('#stream-twitter').bind('loaded', function() {
			twttr.anywhere(onAnywhereLoad);
			function onAnywhereLoad(twitter) { twitter.hovercards(); };
		});
	} else {
		twttr.anywhere(onAnywhereLoad);
		function onAnywhereLoad(twitter) { twitter.hovercards(); };
	}
	
	lastFmRecords.init({
		username: 'cdrom600',
		placeholder: 'stream-lastfm',
		defaultthumb: 'http://chris.dzombak.name/img/cover_85px.gif',
		period: 'recenttracks', // which period/type of data do you want to show? you can choose from
						// recenttracks, 7day, 3month, 6month, 12month, overall, 
						// topalbums and lovedtracks
		count: 28,
		refresh: 3,
		offset: -5
    });
    	
	konami = new Konami();
	konami.code = function() {
		$.getScript('http://www.cornify.com/js/cornify.js', function(){  
			for (i=0; i<15; ++i) {
				cornify_add();
			}
		});
	};
	konami.load();
});
