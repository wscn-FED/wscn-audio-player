(function (root, $) {
  function WSAudioPlayer(options) {
    var defaultOptions = {
      src: '',
      container: '',
      autoPlay: false,
      loop: false,
      volumeValue: 5
    }
    if (!options.audio || !options.audio.src) {
      throw new Error('must set the audio source');
      return;
    }
    if (!options.container || (typeof options.container !== 'string')) {
      throw new Error('container must be set and only be string!');
      return;
    }
    this.options = $.extend({}, defaultOptions, options);
    this.audio = null;
    this.container = $(`#${options.container}`);
    this.isPlaying = false;
    this.init();
  }
  function checkTouchEventSupported() {
    return ('ontouchstart' in window) || window.DocumentTouch && (document instanceof DocumentTouch);
  }

  function pauseEvent(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function formatTime(timestamp) {
    let secs = parseInt(timestamp % 60);
    let mins = parseInt((timestamp / 60) % 60);
    secs = (`0${secs}`).slice(-2);
    mins = (`0${mins}`).slice(-2);
    return `${mins}:${secs}`;
  }

  function getEventPageX(evt) {
    let pageX;
    if (/^touch/ig.test(evt.type)) {
      if (evt.touches && evt.touches.length > 0) {
        let evtTouch = evt.touches[0];
        pageX = evtTouch.pageX;
      }
    } else {
      pageX = evt.pageX;
      if (!pageX) {
        pageX = evt.clientX + document.body.scrollLeft - document.body.clientLeft;
      }
    }
    return pageX;
  }

  function launchFullScreen(elem) {
    if (!elem.fullscreenElement && // alternative standard method
      !elem.mozFullScreenElement && !elem.webkitFullscreenElement && !elem.msFullscreenElement) {
      var requestFullScreen = elem.requestFullscreen || elem.msRequestFullscreen || elem.mozRequestFullScreen || elem.webkitRequestFullscreen;
      requestFullScreen.call(elem);
    }
  }

  WSAudioPlayer.prototype.init = function () {
    // init templates
    // set audio dom element
    //attach all events
    this.generateTemplate();
    this.attachEvents();

  }

  WSAudioPlayer.prototype.generateTemplate = function () {
    let template = `<div class="ws-audio">
          <div class="ws-audio-wrap">
            <audio src="${this.options.audio.src}"></audio>
          </div>
          <div class="ws-audio-body">
            <div class="ws-audio-body-left">
              <div class="ws-audio-play-pause">
                <span class="fa fa-play-circle-o"></span>
                <span class="fa fa-pause-circle-o"></span>
              </div>
              <div class="ws-audio-info">
                <div class="ws-aduio-info-title">
                  ${this.options.audio.title}
                </div>
                <div class="ws-audio-info-time">
                  <span class="ws-audio-currenttime">00:00</span>
                  <span class="ws-audio-divider">/</span>
                  <span class="ws-audio-duration">00:00</span>
                </div>
              </div>
            </div>
            <div class="ws-audio-body-right">
              <span class="fa fa-download"></span>
              <span class="ws-audio-size">${this.options.audio.size}</span>
            </div>
          </div>
        </div>`;
    this.container.append(template);
    this.audioElem = this.container.find('audio');
    this.audio = this.audioElem[0];
    this.currentTimeElem = this.container.find('.ws-audio-currenttime');
    this.durationElem = this.container.find('.ws-audio-duration');
    this.playElem = this.container.find('.fa-play-circle-o');
    this.pauseElem = this.container.find('.fa-pause-circle-o');
    this.playAndPauseElem = this.container.find('.ws-audio-play-pause');
  }

  WSAudioPlayer.prototype.attachEvents = function() {
    const self = this;

    this.audio.addEventListener('loadstart', function () {
      console.log('audio start loading')
    }, false);
    this.audio.addEventListener('loadedmetadata', function (e) {
      console.log('loaded meta data...')
      self.durationElem.text(formatTime(self.audio.duration));
    }, false);

    this.audio.addEventListener('durationchange', function () {
      console.log('duration change');
    }, false);

    this.audio.addEventListener('loadeddata', function () {
      console.log('loaded data');
    }, false);

    this.audio.addEventListener('timeupdate', function (e) {
      //update currentTime
      let currentTime = self.audio.currentTime;
      self.currentTimeElem.text(formatTime(currentTime));

    }, false);

    this.audio.addEventListener('ended', function() {
      self.isPlaying = false;
      self.playAndPauseElem.removeClass('is-playing');
    }, false);

    this.playElem.on('click', function(e) {
      self.isPlaying = true;
      self.playAndPauseElem.addClass('is-playing');
      self.audio.play();
    });
    this.pauseElem.on('click', function(e) {
      self.isPlaying = false;
      self.playAndPauseElem.removeClass('is-playing');
      self.audio.pause();
    });

  }

  root.WSAudioPlayer = WSAudioPlayer;
})(window, jQuery);
