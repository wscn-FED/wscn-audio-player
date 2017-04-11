# wscn-audio-player


### How to use it

1. `npm run build`

2. include dist/ws-audio.js

3. in your html
```html
  <div id="audio-player"></div>

  <script type="text/javascript">
	window.onload = function() {
		var container = document.querySelector('#audio-player')
		new WSAudioPlayer(container, {
		src: 'http://ok0lm7lph.bkt.clouddn.com/3%E6%9C%8814%E6%97%A5%E4%BB%98%E9%B9%8F%E8%AF%B4.mp3',
		title: '华尔街也爱小户型',
		autoPlay: false,
		loop: false,
		className: 'article',
		isArticle: true
		})
	}
  </script>
```


`$ npm run dev`

`$ npm run build`
