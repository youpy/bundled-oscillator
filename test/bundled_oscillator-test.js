import assert from 'power-assert';
import BundledOscillator from '../lib/bundled_oscillator.js';

describe('BundledOscillator', () => {
  let osc;
  let context;

  beforeEach(() => {
    context = new AudioContext();

    let config = [
      [context.createOscillator(), 1, 0.0, 1],    // f0
      [context.createOscillator(), 2, 0.2, 0.5],  // f1
    ];

    osc = new BundledOscillator(context, config, 0);
  });

  describe('AudioNode properties', () => {
    it("#context", () => {
      assert(osc.context === context);
    });

    it("#numberOfInputs", () => {
      assert(osc.numberOfInputs === 0);
    });

    it("#numberOfOutputs", () => {
      assert(osc.numberOfOutputs === 1);
    });

    it("#channelCount", () => {
      assert(osc.channelCount === 2);
    });

    it("#channelCount=", () => {
      osc.channelCount = 3;

      assert(osc.channelCount === 3);
    });

    it("#channelCountMode", () => {
      assert(osc.channelCountMode === 'max');
    });

    it("#channelCountMode=", () => {
      osc.channelCountMode = 'explicit';

      assert(osc.channelCountMode === 'explicit');
    });

    it("#channelInterpretation", () => {
      assert(osc.channelInterpretation === 'speakers');
    });

    it("#channelInterpretation=", () => {
      osc.channelInterpretation = 'discrete';

      assert(osc.channelInterpretation === 'discrete');
    });
  });

  describe('AudioNode methods', () => {
    it('#connect(AudioNode)', () => {
      let destination = context.destination;
      osc.connect(destination);

      assert(osc.channelCount === 2);
    });

    it('#connect(AudioParam)', () => {
      let gainNode = context.createGain();
      osc.connect(gainNode.gain);

      assert(osc.channelCount === 2);
    });

    it('#disconnect()', () => {
      osc.disconnect();
    });
  });

  describe('OscillatorNode properties', () => {
    it('#frequency', () => {
      assert(osc.frequency.constructor.name === 'WrappedAudioParam');
      assert(osc.frequency.value === 440);

      osc.frequency.value = 200;

      assert(osc.frequency.value === 200);
    });

    it('#detune', () => {
      assert(osc.detune.constructor.name === 'AudioParam');
      assert(osc.detune.value === 0);
    });

    it('#type', () => {
      assert(osc.type === 'bundled-oscillator');
    });
  });

  describe('OscillatorNode methods', () => {
    it('#start()', () => {
      osc.start();
    });

    it('#start(when)', () => {
      osc.start(123);
    });

    it('#stop()', () => {
      osc.start();
      osc.stop();
    });

    it('#stop(when)', () => {
      osc.start();
      osc.stop(123);
    });
  });

  describe('OscillatorNode events', () => {
    it('onended', () => {
      let value = false;
      let fn = () => {
        value = true;
      };

      osc.onended = fn;

      assert(osc.onended === fn);

      osc.connect(osc.context.destination);

      osc.start();
      osc.stop(0.1);

      assert(value === false);

      osc.context.$processTo("00:00.50");

      assert(value === false);

      osc.context.$processTo("00:00.100");

      assert(value === true);
    });
  });
});
