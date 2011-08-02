// Last.Fm Records 3.1

// Copyright 2008 -
// Jeroen Smeets
// http://jeroensmeets.net/

// Released under GPL license, with an additional remark:
// If you release this code as part of your own package,
// you have to change the API key. For more info, see
// http://www.last.fm/api/account

var lastFmRecords = (function() {

  // private, reachable through public setters
  var _user;
  var _period        = '7day';
  var _count         = 6;
  var _styletype     = ''; // can be highslide, lightbox
  var _refreshmin    = 3;
  var _placeholder   = 'lastfmrecords';
  var _defaultthumb  = 'http://cdn.last.fm/depth/catalogue/noimage/cover_85px.gif';
  var _debug         = false;
  var _gmt_offset    = '+1';
  var _linknewscreen = 0;

  /////////////
  // private //
  /////////////

  var _imgs_found    = [];

  // capitals to pretend these are constant
  var _LASTFM_APIKEY = 'fbfa856cc3af93c43359b57921b1e64e';
  var _LASTFM_WS_URL = 'http://ws.audioscrobbler.com/2.0/';

  // last.fm added a default album image, and I don't like it
  var _LASTFM_DEFAULTIMG = 'http://cdn.last.fm/flatness/catalogue/noimage/2/default_album_medium.png';

  function _logStatus(text) {
    if (_debug)
      if ('undefined' != typeof console)
        if ('function' == typeof console.log)
          if ('object' == typeof text)
            console.log(text);
          else
            console.log('last.fm.records: ' + text);
  };

  function _getLastFMData() {
    var _method = false;
    switch(_period) {
      case 'lovedtracks':
        _method = 'user.getlovedtracks';
        break;
      case 'topalbums':
        _method = 'user.gettopalbums';
        break;
      case 'overall':
      case '7day':
      case '3month':
      case '6month':
      case '12month':
        _method = 'user.gettopalbums&period=' + _period;
        break;
      default:
        _method = 'user.getrecenttracks';
    }
    jQuery.getJSON(
      _LASTFM_WS_URL + '?method=' + _method + '&user=' + _user + '&api_key=' + _LASTFM_APIKEY + '&limit=50&format=json&callback=?',
      lastFmRecords.processLastFmData
    );
  };

  function _getArtistData(_artistmbid) {
    jQuery.getJSON(
      _LASTFM_WS_URL 
      + '?method=artist.getinfo&mbid=' + _artistmbid + '&api_key=' + _LASTFM_APIKEY + '&format=json&callback=?', 
      lastFmRecords.processArtistData
    );
  };

  function _errorInLastFmResponse(data) {
    var _errorfound = false;
    var _errormsg;
    jQuery.each(data, function(tag, val) {
      if ('error' == tag) {
        _errorfound = true;
        _errormsg = ' (' + val + ')';
      }
      if (_errorfound && ('message' == tag)) {
        _errormsg = val + _errormsg;
      }
    });

    if (_errorfound) {
      _logStatus('last.fm reported error: ' + _errormsg);
    }

    return _errorfound;
  }

  function _findLargestImage(_imgarray) {
    // _imgarray is an array returned by last.fm that looks like

    // "image":[{"#text":"http:\/\/images.amazon.com\/images\/P\/B00004YYTW.02._SCMZZZZZZZ_.jpg","size":"small"},
    //               {"#text":"http:\/\/images.amazon.com\/images\/P\/B00004YYTW.02._SCMZZZZZZZ_.jpg","size":"medium"},
    //               {"#text":"http:\/\/images.amazon.com\/images\/P\/B00004YYTW.02._SCMZZZZZZZ_.jpg","size":"large"}
    //              ]

    _biggestYet = false;

    jQuery.each(_imgarray, function(j, _img) {
      if ('large' == _img.size) {
        _biggestYet = _img['#text'];
        // biggest found, get out of this loop
        return false;
      } else if ('medium' == _img.size) {
        _biggestYet = _img['#text'];
      } else if (('small' == _img.size) && ('' == _biggestYet)) {
        _biggestYet = _img['#text'];
      }
    });

    return (_LASTFM_DEFAULTIMG == _biggestYet) ? false : _biggestYet;
  }

  function _processLastFmData(data) {
    // error in response?
    if (_errorInLastFmResponse(data)) {
      return false;
    }

    // get the cd data from the json
    switch(_period) {
      case 'recenttracks':
        data = data.recenttracks.track;
        break;
      case 'lovedtracks':
        data = data.lovedtracks.track;
        break;
      default:
        data = data.topalbums.album;
    }

    if (!data) {
      _logStatus('No return data from Last.fm');
      return false;
    }

    // JNS 2009-07-30
    // thanks to my friend xample who only listened to 1 album last week,
    // i was able to fix this bug:
    // if only one result is found, data is not an array of albums/tracks but just one album/track.
    if (data.name && 'string' == typeof data.name) {
      data = [data];
    }

    jQuery.each(data, function(i, _json) {  
      if (i > _count) {
        return false;
      }
      var track = [];
      track.cdcover    = _json.image ? _findLargestImage(_json.image) : false;
      track.artistname = _json.artist['#text'] || _json.artist.name;
      track.artistmbid = _json.artist['mbid'];
      track.name       = _json.name;
      track.mbid       = _json.mbid;
      // does the url include 'http://'? if not add it to prevent relative links
      track.url        = ('http://' == _json.url.substr(0, 7).toLowerCase())
                       ? _json.url
                       : 'http://' + _json.url;
      if ('recenttracks' == _period) {
        // aaargh! json has changed!
        if (_json['@attr'] && ('true' == _json['@attr'].nowplaying)) {
          track.time     = 'listening now';
        } else {
          track.time     = ('undefined' == typeof _json.date)
                         ? 'some time'
                         : _getTimeAgo(_json.date['#text'], _gmt_offset);
        }
      } else {
        track.time = '';
      }

      _showCover(i, track);
    });

    if (_refreshmin > 0) {
      setTimeout('lastFmRecords.refreshCovers();', _refreshmin * 60000);
    }
  };

  function _showCover(_id, _track) {
    // store last.fm data about this track in (well, near, thanks to jQuery) the image
    jQuery.each(_track, function(tag, val) {
      jQuery('#lastfmcover' + _id).data(tag, val);
    });
    
    // always set title of image
    var _title = _track.name + ' by ' + _track.artistname;
    if ('' != _track.time) {
      _title += ' (' + _track.time + ')';
    }
    jQuery('#lastfmcover' + _id).attr('title', _title);
    if ('' == _track.cdcover) {
      // no cover for cd, do we have an image for the artist?
      if (_imgs_found[_track.artistmbid] && ('*' != _imgs_found[_track.artistmbid])) {
        // yes, use that url
        jQuery('#lastfmcover' + _id).attr('src', _imgs_found[_track.artistmbid]);
      } else {
        // nope, let's ask last.fm.
        if ('*' != _imgs_found[_track.artistmbid]) {
          if (_track.artistmbid) {
            _logStatus('cover for ' + _track.name + ' not found, trying to find image of artist ' + _track.artistname);
            // Setting a star to know we're already looking for this one
            _imgs_found[_track.artistmbid] = '*';
            _getArtistData(_track.artistmbid);
          } else {
            // TODO find image for artist
            _logStatus('no last.fm data found for artist ' + _track.artistname);
          }
        }

        jQuery('#lastfmcover' + _id).attr('src', _defaultthumb);
        jQuery('#lastfmcover' + _id).addClass(_track.artistmbid);
      }
    } else {
      // point src and href of parent a to the image
      // and make link clickable
      jQuery('#lastfmcover' + _id).attr('src', _track.cdcover).parent('a').attr('href', _track.url).unbind('click', lastFmRecords.dontFollowLink);
    }
  };

  function _processArtistData(data) {
    // error in response?
    if (_errorInLastFmResponse(data)) {
      return false;
    }

    // data = data.artist;
    jQuery.each(data, function(i, _json) {
      _imgurl = _findLargestImage(_json.image);
      _mbid   = _json.mbid;
      // find images that need to be changed
      jQuery('.' + _mbid).each( function() {
        // point src and href of parent a to the image and make link clickable
        jQuery(this).attr('src', _imgurl).removeClass(_mbid).parent('a').attr('href', _json.url).unbind('click', lastFmRecords.dontFollowLink);
      });

      // remember we have an url for this artist
      _imgs_found[_mbid] = _imgurl;

      // stop looping
      return false;
    });
  };

  // this code is just too complex, I know. Suggestions?
  function _getTimeAgo(_t, gmt_offset) {
    // _logStatus('trying to figure out how long ago ' + _t + ' is, in your timezone ' + gmt_offset);
    
    // difference between then and now
    var _diff = new Date() - new Date(_t);
    // take into account the timezone difference
    _diff = _diff - (gmt_offset * 60000 * 60);

    var _d = [];
    // how many years in the difference? not many, I hope ;-)
    _d.ye = parseInt(_diff / (1000 * 60 * 60 * 24 * 365));
    _d.da = parseInt(_diff / (1000 * 60 * 60 * 24)) - (_d.ye * 365);
    _d.ho = parseInt(_diff / (1000 * 60 * 60)) - (_d.ye * 365 * 24) - (_d.da * 24);
    _d.mi = parseInt(_diff / (1000 * 60)) - (_d.ye * 365 * 24 * 60) - (_d.da * 24 * 60) - (_d.ho * 60);

    var _meantime = [];
    if (_d.ye > 0) { _meantime.push(_d.ye + ' year' + _getPluralS(_d.ye)); }
    if (_d.da > 0) { _meantime.push(_d.da + ' day' + _getPluralS(_d.da)); }
    if (_d.ho > 0) { _meantime.push(_d.ho + ' hour' + _getPluralS(_d.ho)); }
    if (_d.mi > 0) { _meantime.push(_d.mi + ' minute' + _getPluralS(_d.mi)) };

    // TODO: replace last comma with 'and'
    return _meantime.join(', ') + ' ago';
  };

  function _getPluralS(_c) {
    return (1 == _c) ? '' : 's';
  };

  function _handleError(_msg, _url, _linenumber) {
    var _err  = [];
    _err.msg  = _msg;
    _err.url  = _url;
    _err.line = _linenumber;
    _err.ref  = document.location.href;
    _logStatus(_err);

    // returning false means javascript won't stop when it finds an error
    return false;
  };

  ////////////
  // public //
  ////////////

  return {
    
    addStyle: function(styletype) {
      _logStatus('function addStyle not supported yet');
    },

    setUser: function(orUsername) {
      // TODO: validation
      _user = orUsername;
    },

    setPeriod: function(orPeriod) {
      // TODO: just todo ;-)
      _period = orPeriod;
    },

    setCount: function(orCount) {
      var _pI = parseInt(orCount);
      if (_pI > 0) {
        _count = _pI;
      }
    },

    setStyle: function(orStyle) {
      // TODO: validation
      _styletype = orStyle;
    },

    setPlaceholder: function(orPlaceholder) {
      // TODO: validate
      _placeholder = orPlaceholder;
    },

    setDefaultThumb: function(orDefaultThumb) {
        // TODO: validate
        _defaultthumb = orDefaultThumb;
    },

    setRefreshMinutes: function(orRefresh) {
      var _pI = parseInt(orRefresh);
      if (_pI > 0) {
        _refreshmin = _pI;
      }
    },

    setTimeOffset: function(orOffset) {
      _gmt_offset = parseInt(orOffset);
    },

    setLinkNewScreen: function(orLinkNewScreen) {
      _linknewscreen = ('1' == orLinkNewScreen);
    },

    debug: function() {
      _debug = true;
    },

    err: function(msg, url, linenumber) {
      _handleError(msg, url, linenumber);
    },

    dontFollowLink: function() {
      // made it a function so I can unbind it
      return false;
    },

    init: function(_settings) {
      _logStatus('initializing');

      // send javascript errors to error handler
      // to catch javascript errors that could make js stop
      jQuery(window).bind('error', lastFmRecords.err);
      _logStatus('registering error handler');

      if (_settings.placeholder)  {
        this.setPlaceholder(_settings.placeholder);
      }

      // is a string [lastfmrecords|period|count] found on the page?
      var _regex = /\[lastfmrecords\|[a-z]+\|[0-9]+\]/;
      // get the strings in it
      var _match = document.body.innerHTML.match(_regex);
      _logStatus(_match);
      if (_match) {
        // and put the div where the cd covers should be
        document.body.innerHTML = document.body.innerHTML.replace(_regex, '<div id=' + _placeholder + '></div>');

        // change settings based on _match
        _match = _match[0].replace('[', '').replace(']', '').split('|');
        _logStatus('Hey, that\'s nice, this site is using the [lastfmrecords|period|count] way of showing covers.');
        if (_match[1]) {
          _settings.period = _match[1];
          _logStatus('Changing period to ' + _match[1]);
        }
        if (_match[2]) {
          _settings.count = _match[2];
          _logStatus('Changing number of covers to ' + _match[2]);
        }
      }

      if (jQuery("div#" + _placeholder).length < 1) {
        _logStatus('error: placeholder for cd covers not found');
        return false;
      }

      if (_settings.username)      { this.setUser(_settings.username) }
      if (_settings.period)        { this.setPeriod(_settings.period); }
      if (_settings.defaultthumb)  { this.setDefaultThumb(_settings.defaultthumb); }
      if (_settings.count)         { this.setCount(_settings.count); }
      if (_settings.refresh)       { this.setRefreshMinutes(_settings.refresh); }
      if (_settings.offset)        { this.setTimeOffset(_settings.offset); }
      if (_settings.styletype)     { this.setStyle(_settings.styletype); }
      if (_settings.linknewscreen) { this.setLinkNewScreen(_settings.linknewscreen); }
      if ('1' == _settings.debug)  { this.debug(); }

      _logStatus(_user);
      if (!_user) {
        _logStatus('No last.fm username available. Impossible to fetch listening habits. Goodbye.');
        return false;
      }

      // no need to refresh when period isn't Recent tracks
      if ('recenttracks' != _period) {
        _refreshmin = 0;
      }

      // add an ul to placeholder div
      var _ol = jQuery("<ol></ol>").appendTo("div#" + _placeholder);
      if (!_ol) {
        _logStatus('error: placeholder for cd covers not found');
      }

      // add temporary cd covers
      _logStatus('adding temporary cd covers');
      var _img, _li;
      for (var i = 0; i < _count; i++) {
        _li  = jQuery('<li></li>');

        _a   = jQuery('<a></a>').bind('click', lastFmRecords.dontFollowLink).attr('href', '').appendTo(_li);

        // highslide
        if ('highslide' == _styletype)  {
          _a.click( function() { return hs.expand(this); });
        }

        // lightbox
        else if ('lightbox' == _styletype) {
          _a.attr('rel', 'lightbox');
        }

        // add target=_blank to link 
        else if ('1' == _linknewscreen) {
          _a.attr('target', '_blank');
        }

        _img = jQuery('<img></img>')
                 .attr('src', _defaultthumb)
                 .attr('id', 'lastfmcover' + i)
                 .error(
                   function() {
                     jQuery(this).attr("src", _defaultthumb);
                   })
                 .appendTo(_a);

        _li.appendTo(_ol);
      }

      _getLastFMData();
    },

    refreshCovers: function() {
      _getLastFMData();
    },

    processLastFmData: function(data) {
      // handle it internally
      _processLastFmData(data);
    },

    processArtistData: function(data) {
      // handle it internally
      _processArtistData(data);
    }
  };

})();
