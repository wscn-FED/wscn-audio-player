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

const getDrawCircle = function(canvas) {
  const ctx = canvas.getContext('2d');
  const circ = Math.PI * 2;
  const lineWidth = 2.0;
  const canvasWidth = canvas.offsetWidth;
  const center = {
    x: canvasWidth/2,
    y: canvasWidth/2
  }
  return function(percent) {
    ctx.beginPath();
    ctx.strokeStyle = '#1478F0';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.arc(center.x, center.y, (canvasWidth-2*lineWidth)/2, 0, circ*percent, false);
    ctx.stroke();
  }
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
              <canvas id="ws-audio-progress-bar" width="50" height="50"></canvas>
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
  this.canvasElem = this.container.find('#ws-audio-progress-bar');
  this.drawCircle = getDrawCircle(this.canvasElem[0]);
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
    self.drawCircle(ratio);
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
