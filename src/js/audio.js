require('../scss/audio.scss');

function WSAudioPlayer(options) {
  var defaultOptions = {
    container: '',
    autoPlay: false,
    loop: false,
    audio: {
      src: ''
    }
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

function initCircleProgress(pathElem) {
  var pathDom = pathElem[0];
  var length = pathDom.getTotalLength();
  pathDom.style.strokeDasharray =  `${length} ${length}`;
  pathDom.style.strokeDashoffset = `${length}px`;
  return pathDom;
}

WSAudioPlayer.prototype.init = function () {
  // init templates
  // set audio dom element
  //attach all events
  this.generateTemplate();
  this.attachEvents();

  if (this.options.autoPlay) {
    this.audio.autoplay = true;
    this.play();
  }

  if (this.options.loop) {
    this.audio.loop = true;
  }

}

WSAudioPlayer.prototype.generateTemplate = function () {
  let template = `<div class="ws-audio">
        <div class="ws-audio-wrap">
          <audio src="${this.options.audio.src}"></audio>
        </div>
        <div class="ws-audio-body">
          <div class="ws-audio-body-left">
            <div class="ws-audio-play-pause">
              <div class="ws-audio-progress-bar">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" viewBox="0 0 32 32">
                  <path fill="none" stroke="#4990e2" stroke-width="0.6154" stroke-miterlimit="4" stroke-linecap="butt" stroke-linejoin="miter" d="M31.385 16c0 8.497-6.888 15.385-15.385 15.385s-15.385-6.888-15.385-15.385c0-8.497 6.888-15.385 15.385-15.385s15.385 6.888 15.385 15.385z"></path>
                </svg>
              </div>
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
  this.progressElem = this.container.find('.ws-audio-progress-bar');
  this.progressPathElem = this.progressElem.find('svg > path');
  this.pathDomElem = initCircleProgress(this.progressPathElem);
}

WSAudioPlayer.prototype.updateCircleProgress = function(ratio) {
  var length = this.pathDomElem.getTotalLength();
  this.pathDomElem.style.strokeDashoffset = `${length - length*ratio}px`;
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
    let ratio = currentTime / self.audio.duration;
    self.updateCircleProgress(ratio);
  }, false);

  this.audio.addEventListener('ended', function() {
    self.isPlaying = false;
    self.playAndPauseElem.removeClass('is-playing');
  }, false);

  if (checkTouchEventSupported()) {
    this.playElem[0].addEventListener('touchstart', function(e) {
      pauseEvent(e);
      self.play();
    }, false);

    this.pauseElem[0].addEventListener('touchstart', function(e) {
      pauseEvent(e);
      self.pause();
    }, false);
  } else {
    this.playElem.on('click', function(e) {
      self.play();
    });
    this.pauseElem.on('click', function(e) {
      self.pause();
    });
  }
}


WSAudioPlayer.prototype.play = function() {
  this.isPlaying = true;
  this.playAndPauseElem.addClass('is-playing');
  this.audio.play();
}

WSAudioPlayer.prototype.pause = function() {
  this.isPlaying = false;
  this.playAndPauseElem.removeClass('is-playing');
  this.audio.pause();
}

module.exports = WSAudioPlayer;
