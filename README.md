# wscn-audio-player


### How to use it

1. add jquery

2. include dist/ws-audio-player.min.js

3. in your html
```html
  <div id="audio-player"></div>

  <script type="text/javascript">
    $(function() {
      var audio = new WSAudioPlayer({
        container: 'audio-player',
        audio: {
          src: 'http://7xj610.com1.z0.glb.clouddn.com/New%20Empire%20-%20A%20Little%20Braver.mp3',
          title: '华尔街也爱小户型',
          size: '11.32MB'
        },
        autoPlay: false,
        loop: false
      })
    });
  </script>
```


`$ npm run dev`

`$ npm run build`
