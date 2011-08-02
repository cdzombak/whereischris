
$(document).ready(function(){
    if ($("#recently-twitter").length) {
		$("#recently-twitter").tweet({
			username: "cdzombak",
			join_text: "",
			count: 15,
			loading_text: "loading...",
			refresh_interval: 120,
			link_user: false
		});
		$('#recently-twitter').bind('loaded', function() {
			twttr.anywhere(onAnywhereLoad);
			function onAnywhereLoad(twitter) { twitter.hovercards(); };
		});
	} else {
		twttr.anywhere(onAnywhereLoad);
		function onAnywhereLoad(twitter) { twitter.hovercards(); };
	}
	
	lastFmRecords.init({
		username: 'cdrom600',
		placeholder: 'recently-lastfm',
		defaultthumb: 'img/cover_85px.gif',
		period: '3month', // which period/type of data do you want to show? you can choose from
						// recenttracks, 7day, 3month, 6month, 12month, overall, 
						// topalbums and lovedtracks
		count: 18,
		refresh: 3,
		offset: -5
    });
    	
	konami = new Konami();
	konami.code = function() {
		var s = document.createElement('script');
		s.type='text/javascript';
		document.body.appendChild(s);
		s.src='http://erkie.github.com/asteroids.min.js';
		void(0);
	};
	konami.load();
});
