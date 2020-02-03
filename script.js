import Tone from 'tone';
import Kick from './kick'
import Snare from './snare'
import HiHat from './hihat'
import Tom from './tom'
import hihatSample from './sounds/hihat.wav';

window.onload = function () {
  var context = new AudioContext;

  var startButton = document.getElementById('start');
  var stopButton = document.getElementById('stop');
  var drumButton = document.getElementById('drum');

  var getBuffer = function(url, context) {
    return window.fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
  };

  startButton.addEventListener('click', function () {
    getBuffer(hihatSample, context)
      .then(buffer => {
        var kick = new Kick(context);
        var snare = new Snare(context);
        var hihat = new HiHat(context, buffer);
        var tom = new Tom(context)

        Tone.Transport.bpm.value = 100;

        const compasses = '4m'

        const kickLoop = new Tone.Loop(time => kick.trigger(time), '4n')
        const snareLoop = new Tone.Loop(time => snare.trigger(time), '2n')
        const hihatLoop = new Tone.Loop(time => hihat.trigger(time), '4n')
        const hihatLoop2 = new Tone.Loop(time => hihat.trigger(time), '4n')
        const tomLoop = new Tone.Loop(time => tom.trigger(time), '2n')

        kickLoop.start(0).stop(compasses)
        snareLoop.start('9n').stop(compasses)
        hihatLoop.start(0).stop(compasses)
        hihatLoop2.start('6n').stop(compasses)
        tomLoop.start('4n.').stop(compasses)

        Tone.Transport.start();
      });
  });

  stopButton.addEventListener('click', function () {
    Tone.Transport.stop();
  })

  drumButton.addEventListener('click', function () {
    const tom = new Tom(context)
    const compasses = '4m'

    const tomLoop = new Tone.Loop(time => tom.trigger(time), '4n')

    tomLoop.start(0).stop(compasses)

    Tone.Transport.start();
  })
}
