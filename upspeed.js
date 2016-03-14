'use strict';

var Upspeed = function(clientId) {
    SC.initialize({
        client_id: clientId
    });
    this.currentTrackUrl = '';
    this.timerHandle = 0;
    this.playBackRate = 1;
    this.trackHowl = undefined;
    this.clientId = clientId;
}

Upspeed.prototype.playSong = function(song_url, dontPushState) {
    var regexp = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/;
    if(!(song_url.match(regexp) && song_url.match(regexp)[2])) return;
    if(!dontPushState) {
        var relativeUrl = song_url.match(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/)[3];
        history.pushState({songUrl: song_url}, "", "/Upspeed/" + relativeUrl);
    }
    var that = this;
    this.currentTrackUrl = song_url;
    $('#thaSpin').show();
    $('#rqurl').val(this.currentTrackUrl);

    // Get the URL
    SC.resolve(song_url).then(function(track) {
        $('#coverArt').attr('src', track.artwork_url);
        $('#songName').text(track.title);
        $('#songArtist').text(track.user.username).attr('href', track.user.permalink_url);
        $('#songSpeed').text('0%');
        $('#nowPlaying').show();
        that.process(track);
    });
}

Upspeed.prototype.process = function(track) {
    if (this.trackHowl) {
        clearInterval(this.timerHandle);
        this.playBackRate = 1;
        this.trackHowl.stop();
    }
    var that = this;
    var howl = new Howl({ src: [track.stream_url+'?client_id='+this.clientId], format:'mp3', loop: true, 
    onloaderror:function(err){
        console.log(err);
        var ta = false;
    }, onload: function() { that.startPlaying(); } });
    this.trackHowl = howl;
}

Upspeed.prototype.startPlaying = function() {
    var that = this;
    this.trackHowl.play();
    $('#thaSpin').hide();
    $('#songSpeed').text('100%');
    this.timerHandle = setInterval(function(){
        that.playBackRate += 0.01;
        that.trackHowl.rate(that.playBackRate);
        $('#songSpeed').text(Math.floor(that.playBackRate * 100) + '%');
    }, 500);
}

var upspeed = new Upspeed('b2568f1fd1ca4d61013a8102c9526ae8');


if(document.location.pathname != '/Upspeed/')
{
    upspeed.playSong('https://www.soundcloud.com/'+ document.location.pathname.match(/\/upspeed\/([^?]+)(?:\??.+)?/)[1], true);
}