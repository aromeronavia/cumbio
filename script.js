import Tone from 'tone';
import hihatSample from './sounds/hihat.wav';

window.onload = function () {
  var context = new AudioContext;

  function Kick(context) {
    this.context = context;
  };

  Kick.prototype.setup = function() {
    this.osc = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination)
  };

  Kick.prototype.trigger = function(time) {
    this.setup();

    this.osc.frequency.setValueAtTime(150, time);
    this.gain.gain.setValueAtTime(1, time);

    this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    this.osc.start(time);

    this.osc.stop(time + 0.5);
  };

  function Snare(context) {
    this.context = context;
  };

  Snare.prototype.noiseBuffer = function() {
    var bufferSize = this.context.sampleRate;
    var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    var output = buffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  };

  Snare.prototype.setup = function() {
    this.noise = this.context.createBufferSource();
    this.noise.buffer = this.noiseBuffer();
    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    this.noise.connect(noiseFilter);

    this.noiseEnvelope = this.context.createGain();
    noiseFilter.connect(this.noiseEnvelope);
    this.noiseEnvelope.connect(this.context.destination);

    this.osc = this.context.createOscillator();
    this.osc.type = 'triangle';

    this.oscEnvelope = this.context.createGain();
    this.osc.connect(this.oscEnvelope);
    this.oscEnvelope.connect(this.context.destination);
  };

  Snare.prototype.trigger = function(time) {
    this.setup();

    this.noiseEnvelope.gain.setValueAtTime(1, time);
    this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    this.noise.start(time)

    this.osc.frequency.setValueAtTime(100, time);
    this.oscEnvelope.gain.setValueAtTime(0.7, time);
    this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    this.osc.start(time)

    this.osc.stop(time + 0.2);
    this.noise.stop(time + 0.2);
  };

  function HiHat(context, buffer) {
    this.context = context;
    this.buffer = buffer;
  };

  HiHat.prototype.setup = function() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.context.destination);
  };

  HiHat.prototype.trigger = function(time) {
    this.setup();
    this.source.start(time);
  };

  var startButton = document.getElementById('start');
  var stopButton = document.getElementById('stop');

  function getTempoOffset(tempo) {
    return 60 / tempo
  }

  var getBuffer = function(url, context) {
    return window.fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
  };

  startButton.addEventListener('click', function () {
    getBuffer(hihatSample, context)
      .then(buffer => {
        console.warn(buffer);
        var kick = new Kick(context);
        var snare = new Snare(context);
        var hihat = new HiHat(context, buffer);

        Tone.Transport.bpm.value = 160;

        const compasses = '4m'

        const kickLoop = new Tone.Loop(time => kick.trigger(time), '4n')
        const snareLoop = new Tone.Loop(time => snare.trigger(time), '2n')
        const hihatLoop = new Tone.Loop(time => hihat.trigger(time), '8n')
        const hihatLoop2 = new Tone.Loop(time => hihat.trigger(time), '2n')

        kickLoop.start(0).stop(compasses)
        snareLoop.start('4n').stop(compasses)
        hihatLoop.start(0).stop(compasses)

        Tone.Transport.start();
      });
  });

  stopButton.addEventListener('click', function () {
    Tone.Transport.stop();
  })
}
