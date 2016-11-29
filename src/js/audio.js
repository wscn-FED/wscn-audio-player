require('../scss/audio.scss')
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
              <span class="ws-audio-play-btn">
                <i class="iconfont">&#xe60a;</i>
              </span>
              <span class="ws-audio-pause-btn">
                <i class="iconfont">&#xe60b;</i>
              </span>
            </div>
            <div class="ws-audio-info">
              <div class="ws-aduio-info-title">
                ${this.options.audio.title}
              </div>
              <div class="ws-audio-info-time">
                <span class="ws-audio-currenttime">00:00</span>
                <div class="ws-audio-progress">
                    <div class="ws-audio-progress-slider"></div>
                    <div class="ws-audio-progress-bar"></div>
                    <div class="ws-audio-progress-active-bar"></div>
                </div>
                <span class="ws-audio-duration">00:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  this.container.append(template);
  this.audioElem = this.container.find('audio');
  this.audio = this.audioElem[0];
  this.currentTimeElem = this.container.find('.ws-audio-currenttime');
  this.durationElem = this.container.find('.ws-audio-duration');
  this.playElem = this.container.find('.ws-audio-play-btn i');
  this.pauseElem = this.container.find('.ws-audio-pause-btn i');
  this.playAndPauseElem = this.container.find('.ws-audio-play-pause');
  this.progress = this.container.find('.ws-audio-progress');
  this.activeProgressbar = this.container.find('.ws-audio-progress-active-bar');
  this.progressBar = this.container.find('.ws-audio-progress-bar');
  this.progressbarSlider = this.container.find('.ws-audio-progress-slider');

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
    const currentTime = self.audio.currentTime;
    self.currentTimeElem.text(formatTime(currentTime));
    //update progress bar
    const duration = self.audio.duration;
    const ratio = (currentTime / duration) * 100;
    self.activeProgressbar.css('width', ratio + '%');
    self.progressbarSlider.css('left', ratio + '%');
  }, false);

  this.audio.addEventListener('ended', function() {
    self.isPlaying = false;
    self.playAndPauseElem.removeClass('is-playing');
  }, false);

  function handleProgressClickJump(e) {
    pauseEvent(e);
    let offset = self.progress.offset();
    let width = self.progress.width();
    let pageX = getEventPageX(e);
    let diffWidth = (pageX - offset.left);
    self.audio.currentTime = (diffWidth / width) * self.audio.duration;
  }

  if (checkTouchEventSupported()) {
    this.playElem[0].addEventListener('touchstart', function(e) {
      pauseEvent(e);
      self.play();
    }, false);

    this.pauseElem[0].addEventListener('touchstart', function(e) {
      pauseEvent(e);
      self.pause();
    }, false);

    this.activeProgressbar[0].addEventListener('touchstart', handleProgressClickJump, false);
    this.progressBar[0].addEventListener('touchstart', handleProgressClickJump, false);
    this.progressbarSlider[0].addEventListener('touchstart', handleProgressClickJump, false);
  } else {
    this.playElem.on('click', function(e) {
      self.play();
    });
    this.pauseElem.on('click', function(e) {
      self.pause();
    });

    this.activeProgressbar.on('click', handleProgressClickJump);
    this.progressBar.on('click', handleProgressClickJump);
    this.progressbarSlider.on('click', handleProgressClickJump);
  }

    //handle progress slider actions
  const slideMoveHandler = function (evt) {
    pauseEvent(evt);
    let offset = self.progress.offset();
    let width = self.progress.width();
    let pageX = getEventPageX(evt);
    let diffWidth = (pageX - offset.left);
    if (diffWidth <= 0) {
      diffWidth = 0
    }
    if (diffWidth >= width) {
      diffWidth = width;
    }
    let ratio = (diffWidth / width) * 100;
    self.progressbarSlider.css('left', ratio + '%');
    self.activeProgressbar.css('width', ratio + '%');
    let slideCurrentTime = (diffWidth / width) * self.audio.duration;
    self.currentTimeElem.text(formatTime(slideCurrentTime));
    self.audio.currentTime = slideCurrentTime;
  }

  //add touch events if touch supported
  if (checkTouchEventSupported()) {
    this.progressbarSlider[0].addEventListener('touchstart', function (evt) {
      evt.preventDefault();
      document.addEventListener('touchmove', slideMoveHandler, false);
    });
    document.addEventListener('touchend', function (evt) {
      evt.preventDefault();
      document.removeEventListener('touchmove', slideMoveHandler, false);
    }, false);
  } else {
    this.progressbarSlider.on('mousedown', function (evt) {
      document.addEventListener('mousemove', slideMoveHandler, false);
    });
    document.addEventListener('mouseup', function () {
      document.removeEventListener('mousemove', slideMoveHandler, false);
    }, false);
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
