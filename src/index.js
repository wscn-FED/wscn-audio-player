import { formatTime, isTouchSupported } from './utils'
import './index.scss'
const defaultOptions = {
  title: '华尔街见闻专辑',
  hasLoading: true,
  isArticle: false,
  autoplay: false,
  loop: false
}

class WSAudioPlayer {
  constructor(container, options = {}) {
    this.options = Object.assign({}, defaultOptions, options)
    this.container = container
    this.hasLoadMeta = false
    this.sliderMoving = false
    this.isPlaying = false
    this.handleLoadedMetaData = this.handleLoadedMetaData.bind(this)
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this)
    this.handleWaiting = this.handleWaiting.bind(this)
    this.handleCanPlay = this.handleCanPlay.bind(this)
    this.handleEned = this.handleEned.bind(this)
    this.handleSliderDown = this.handleSliderDown.bind(this)
    this.handlePlay = this.handlePlay.bind(this)
    this.handlePause = this.handlePause.bind(this)
    this.handleSliderMove = this.handleSliderMove.bind(this)
    this.handleSliderUp = this.handleSliderUp.bind(this)
    this.setTemplate()
    this.attachEvents()
    const { autoplay, loop } = this.options
    if (autoplay) {
      this.audio.setAttribute('autoplay', '')
      this.handlePlay()
    }
    if (loop) {
      this.audio.setAttribute('loop', '')
    }
  }
  setTemplate() {
    const { title, src, className, hasLoading, isArticle } = this.options
    const tempClass = className || 'default'
    let loaderTpl = `<div class="ryaudio-loader">
                  <div class="sk-fading-circle">
                    <div class="sk-circle1 sk-circle"></div>
                    <div class="sk-circle2 sk-circle"></div>
                    <div class="sk-circle3 sk-circle"></div>
                    <div class="sk-circle4 sk-circle"></div>
                    <div class="sk-circle5 sk-circle"></div>
                    <div class="sk-circle6 sk-circle"></div>
                    <div class="sk-circle7 sk-circle"></div>
                    <div class="sk-circle8 sk-circle"></div>
                    <div class="sk-circle9 sk-circle"></div>
                    <div class="sk-circle10 sk-circle"></div>
                    <div class="sk-circle11 sk-circle"></div>
                    <div class="sk-circle12 sk-circle"></div>
                  </div>
                </div>`
    loaderTpl = hasLoading ? loaderTpl : ''
    const artTpl = `<div class="ryaudio-progress">
                    <span class="ryaudio-progress-active"></span>
                    <div class="ryaudio-progress-bar"></div>
                    <span class="ryaudio-progress-slider"></span>
                  </div>
                  <div class="ryaudio-time-wrap">
                    <span class="ryaudio-controls-currenttime">00:00</span>/
                    <span class="ryaudio-duration">00:00</span>
                  </div>`
    const defTpl = `<span class="ryaudio-controls-currenttime">00:00</span>
                  <div class="ryaudio-progress">
                    <span class="ryaudio-progress-active"></span>
                    <div class="ryaudio-progress-bar"></div>
                    <span class="ryaudio-progress-slider"></span>
                  </div>
                  <span class="ryaudio-duration">00:00</span>`
    const temp = isArticle ? artTpl : defTpl
    const tpl = `<div class="ryaudio ${tempClass}">
      <div class="ryaudio-body">
        <div class="ryaudio-container">
          <audio src="${src}" preload="auto"></audio>
          <div class="ryaudio-controls">
            <div class="ryaudio-controls-inner">
              <div class="ryaudio-controls-play-pause">
                <a class="ryaudio-controls-play">
                  <svg class="icon" width="200px" height="200.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M404.48 762.368l307.2-250.368-307.2-250.368z"  /><path fill="#333333" d="M512 1024C229.888 1024 0 794.112 0 512S229.888 0 512 0s512 229.888 512 512-229.376 512-512 512z m0-988.16C249.344 35.84 35.84 249.344 35.84 512s213.504 476.16 476.16 476.16 476.16-213.504 476.16-476.16-213.504-476.16-476.16-476.16z"  /></svg>
                </a>
                <a class="ryaudio-controls-pause">
                  <svg class="icon" width="200px" height="200.00px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M327.68 272.896h101.888v478.72H327.68zM594.432 272.896H696.32v478.72h-101.888z"  /><path fill="#333333" d="M512 1024C229.888 1024 0 794.112 0 512S229.888 0 512 0s512 229.888 512 512-229.376 512-512 512z m0-988.16C249.344 35.84 35.84 249.344 35.84 512s213.504 476.16 476.16 476.16 476.16-213.504 476.16-476.16-213.504-476.16-476.16-476.16z"  /></svg>
                </a>
                ${loaderTpl}
              </div>
              <div class="ryaudio-controls-content">
                <div class="ryaudio-title">${title}</div>
                <div class="ryaudio-controls-content-main">
                  ${temp}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`
    this.container.innerHTML = tpl
    // set elements
    this.audio = this.container.querySelector('audio')
    this.playAndPause = this.container.querySelector('.ryaudio-controls-play-pause')
    this.playBtn = this.container.querySelector('.ryaudio-controls-play')
    this.pauseBtn = this.container.querySelector('.ryaudio-controls-pause')
    this.progress = this.container.querySelector('.ryaudio-progress-bar')
    this.progressActive = this.container.querySelector('.ryaudio-progress-active')
    this.slider = this.container.querySelector('.ryaudio-progress-slider')
    this.currentTime = this.container.querySelector('.ryaudio-controls-currenttime')
    this.duration = this.container.querySelector('.ryaudio-duration')
    this.loader = this.container.querySelector('.ryaudio-loader')
  }
  attachEvents() {
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetaData, false)
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate, false)
    this.audio.addEventListener('waiting', this.handleWaiting, false)
    this.audio.addEventListener('canplay', this.handleCanPlay, false)
    this.audio.addEventListener('ended', this.handleEned, false)
    this.playBtn.addEventListener('click', this.handlePlay, false)
    this.pauseBtn.addEventListener('click', this.handlePause, false)
    if (isTouchSupported()) {
      this.slider.addEventListener('touchstart', this.handleSliderDown, false)
    } else {
      this.slider.addEventListener('mousedown', this.handleSliderDown, false)
    }
  }
  handleLoadedMetaData() {
    this.hasLoadMeta = true
    this.duration.textContent = formatTime(this.audio.duration)
  }
  handleTimeUpdate() {
    if (!this.sliderMoving) {
      this.currentTime.textContent = formatTime(this.audio.currentTime)
      const rect = this.progress.getBoundingClientRect()
      let aw = parseFloat(this.audio.currentTime / this.audio.duration) * rect.width
      if (aw > rect.width) {
        aw = rect.width
      }
      this.progressActive.style.width = aw + 'px'
      this.slider.style.left = (aw - 7) + 'px'
    }
  }
  handleWaiting() {
    if (this.options.hasLoading) {
      this.loadTimer = setTimeout(() => {
        this.loader.classList.add('show')
      }, 800)
    }
  }
  handleCanPlay() {
    if (!this.options.hasLoading) return
    if (this.loadTimer) clearTimeout(this.loadTimer)
    this.loader.classList.remove('show')
  }
  handleEned() {
    this.playAndPause.classList.remove('playing')
  }
  handlePlay() {
    const { onPlay } = this.options
    if (onPlay && typeof onPlay === 'function') {
      onPlay(this.audio)
    } else {
      if (!this.audio.currentSrc) {
        this.audio.src = this.options.src
      }
      this.audio.play()
      this.playAndPause.classList.add('playing')
      this.isPlaying = true
    }
  }
  handlePause() {
    this.audio.pause()
    this.playAndPause.classList.remove('playing')
    this.isPlaying = false
  }
  handleSliderDown() {
    if (!this.hasLoadMeta) return
    if (isTouchSupported()) {
      document.addEventListener('touchmove', this.handleSliderMove, false)
      document.addEventListener('touchend', this.handleSliderUp, false)
    } else {
      document.addEventListener('mousemove', this.handleSliderMove, false)
      document.addEventListener('mouseup', this.handleSliderUp, false)
    }
  }
  handleSliderMove(e) {
    if (!this.hasLoadMeta) return
    this.sliderMoveing = true
    let evt = e
    if (isTouchSupported()) {
      evt = e.touches[0]
    }
    this.setWhenSliderMove(evt)
  }
  handleSliderUp() {
    if (!this.hasLoadMeta) return
    this.sliderMoving = false
    if (!isTouchSupported()) {
      document.removeEventListener('mousemove', this.handleSliderMove, false)
      document.removeEventListener('mouseup', this.handleSliderUp, false)
    } else {
      document.removeEventListener('touchmove', this.handleSliderMove, false)
      document.removeEventListener('touchend', this.handleSliderUp, false)
    }
    if (this.goToCurrentTime) {
      this.audio.currentTime = this.goToCurrentTime
      this.goToCurrentTime = null
    }
    if (this.isPlaying) {
      this.audio.play()
      this.playAndPause.classList.add('playing')
    }
  }
  setWhenSliderMove(e) {
    this.audio.pause()
    const rect = this.progress.getBoundingClientRect()
    let offset = e.pageX - rect.left
    if (offset < 0) {
      offset = 0
    }
    if (offset > rect.width) {
      offset = rect.width
    }
    this.progressActive.style.width = offset + 'px'
    this.slider.style.left = (offset - 7) + 'px'
    this.goToCurrentTime = parseFloat((parseFloat(offset / rect.width) * this.audio.duration).toFixed(6))
  }
}
window.WSAudioPlayer = WSAudioPlayer
export default WSAudioPlayer
