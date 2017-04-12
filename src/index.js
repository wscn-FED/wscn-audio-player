import { formatTime, isTouchSupported } from './utils'
import './index.scss'
const defaultOptions = {
  title: '华尔街见闻专辑',
  isTpl: false,
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
    this.setCurrentTimer = null
    this.loaderTimer = null
    this.handleLoadedMetaData = this.handleLoadedMetaData.bind(this)
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this)
    this.handleWaiting = this.handleWaiting.bind(this)
    this.handlePlaying = this.handlePlaying.bind(this)
    this.handleEned = this.handleEned.bind(this)

    // this.sliderChange = this.sliderChange.bind(this)
    this.sliderInput = this.sliderInput.bind(this)
    this.seekTo = this.seekTo.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)

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
    const { title, src, isTpl } = this.options
    const className = isTpl ? 'article' : 'default'
    const loaderTpl = `<div class="ryaudio-loader ${className}">
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
    const artTpl = `<div class="ryaudio-progress">
                    <span class="ryaudio-progress-active"></span>
                    <input type="range" min="0" value="0" step="0.05" class="ryaudio-progress-bar"/>
                  </div>
                  <div class="ryaudio-time-wrap">
                    <span class="ryaudio-controls-currenttime">00:00</span>/
                    <span class="ryaudio-duration">00:00</span>
                  </div>`
    const defTpl = `<span class="ryaudio-controls-currenttime">00:00</span>
                  <div class="ryaudio-progress">
                    <span class="ryaudio-progress-active"></span>
                    <input type="range" min="0" value="0" step="0.05" class="ryaudio-progress-bar" />
                  </div>
                  <span class="ryaudio-duration">00:00</span>`
    const temp = isTpl ? artTpl : defTpl
    const tpl = `<div class="ryaudio ${className}">
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
    this.progressBar = this.container.querySelector('input[type=range]')
    this.progressActive = this.container.querySelector('.ryaudio-progress-active')
    this.currentTime = this.container.querySelector('.ryaudio-controls-currenttime')
    this.duration = this.container.querySelector('.ryaudio-duration')
    this.loader = this.container.querySelector('.ryaudio-loader')
  }
  attachEvents() {
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetaData, false)
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate, false)
    this.audio.addEventListener('waiting', this.handleWaiting, false)
    this.audio.addEventListener('playing', this.handlePlaying, false)
    this.audio.addEventListener('ended', this.handleEned, false)
    // here need click event, weixin has issue with touchstart
    this.playBtn.addEventListener('click', this.play, false)
    this.pauseBtn.addEventListener('click', this.pause, false)
    this.progressBar.addEventListener('input', this.sliderInput, false)
    // this.progressBar.addEventListener('change', this.sliderChange, false)
    this.progressActive.addEventListener('click', this.seekTo, false)
  }
  handleLoadedMetaData() {
    this.hasLoadMeta = true
    this.progressBar.setAttribute('max', this.audio.duration)
    this.duration.textContent = formatTime(this.audio.duration)
  }
  handleTimeUpdate() {
    this.currentTime.textContent = formatTime(this.audio.currentTime)
    this.setProgressStyle(this.audio.currentTime)
    this.progressBar.value = this.audio.currentTime
  }
  handleWaiting() {
    this.loaderTimer = setTimeout(() => {
      this.loader.classList.add('show')
    }, 300)
  }
  handlePlaying() {
    if (this.loaderTimer) clearTimeout(this.loaderTimer)
    this.loader.classList.remove('show')
  }
  handleEned() {
    this.playAndPause.classList.remove('playing')
  }
  play() {
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
  pause() {
    this.audio.pause()
    this.playAndPause.classList.remove('playing')
    this.isPlaying = false
  }
  setProgressStyle(val) {
    const rect = this.progressBar.getBoundingClientRect()
    let aw = parseFloat(val / this.audio.duration)
    this.progressActive.style.width = parseInt(aw * (rect.width - 16)) + 'px'
  }
  sliderInput(e) {
    if (this.setCurrentTimer) clearTimeout(this.setCurrentTimer)
    this.currentTime.textContent = formatTime(e.target.value)
    this.setProgressStyle(e.target.value)
    this.audio.currentTime = e.target.value
  }
  seekTo(e) {
    const rect = this.progressBar.getBoundingClientRect()
    const offset = e.pageX - rect.left
    const val = parseFloat(offset / rect.width) * this.audio.duration
    this.setProgressStyle(e.target.value)
    this.audio.currentTime = e.target.value
  }
}
window.WSAudioPlayer = WSAudioPlayer
export default WSAudioPlayer
