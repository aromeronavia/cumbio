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

module.exports = HiHat;
