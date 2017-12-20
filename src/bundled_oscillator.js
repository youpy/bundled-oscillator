import WrappedAudioParam from './wrapped_audio_param';

class Node {
  constructor(node, mul, add, amp) {
    this.node = node;
    this.mul = mul;
    this.add = add;
    this.amp = amp;
  }

  get param() {
    return [this.node.frequency, this.mul, this.add];
  }
};

export default class BundledOscillator {
  constructor(context, config, referenceIndex) {
    this._context = context;
    this.nodes = [];

    config.forEach(([osc, mul, add, amp]) => {
      this.nodes.push(new Node(osc, mul, add, amp));
    });

    this._frequency = new WrappedAudioParam(
      referenceIndex,
      this.nodes.map((node) => {
        return node.param;
      })
    );
  }

  get context() {
    return this._context;
  }

  get numberOfInputs() {
    return 0;
  }

  get numberOfOutputs() {
    return 1;
  }

  get channelCount() {
    return this.nodes[0].node.channelCount;
  }

  set channelCount(value) {
    this._eachNode((node) => {
      node.channelCount = value;
    });
  }

  get channelCountMode() {
    return this.nodes[0].node.channelCountMode;
  }

  set channelCountMode(value) {
    this._eachNode((node) => {
      node.channelCountMode = value;
    });
  }

  get channelInterpretation() {
    return this.nodes[0].node.channelInterpretation;
  }

  set channelInterpretation(value) {
    this._eachNode((node) => {
      node.channelInterpretation = value;
    });
  }

  connect(audioNode) {
    this._eachNode((node, amp) => {
      let gain = this.context.createGain();

      gain.gain.setValueAtTime(amp, gain.context.currentTime);
      node.connect(gain);
      gain.connect(audioNode);
    });
  }

  disconnect() {
    this._eachNode((node) => {
      node.disconnect();
    });
  }

  get type() {
    return 'bundled-oscillator';
  }

  set type(value) {
    return;
  }

  get frequency() {
    return this._frequency;
  }

  get detune() {
    return this.nodes[0].node.detune;
  }

  get onended() {
    return this.nodes[0].node.onended;
  }

  set onended(fn) {
    this.nodes[0].node.onended = fn;
  }

  start(when = 0) {
    this._eachNode((node) => {
      node.start(when);
    });
  }

  stop(when = 0) {
    this._eachNode((node) => {
      node.stop(when);
    });
  }

  _eachNode(fn) {
    this.nodes.forEach((node) => {
      fn(node.node, node.amp);
    });
  }
};
