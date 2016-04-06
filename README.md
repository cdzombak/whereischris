# [WhereIsChris](http://whereischris.me)

[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

A quick site hacked together to let family and friends view my progress on road trips. It pulls together my location in real-time along with latest [tweets](https://twitter.com/cdzombak), [Last.fm scrobbles](http://last.fm/user/cdrom600), and [Foursquare checkins](https://foursquare.com/cdzombak/history).

## Location monitoring

…is provided by a simple PHP script that receives updates from my iPhone, running [ChrisTracker](https://github.com/cdzombak/ChrisTracker), and stores them in a JSON file on the server. That file is served by nginx to the JS driving the map view.

## Other features

The map updates every 15 seconds, which is kinda neat.

## Author

Chris Dzombak <[chris.dzombak.name](http://chris.dzombak.name)>

* twitter [@cdzombak](https://twitter.com/cdzombak)
* ADN [@dzombak](https://alpha.app.net/dzombak)
