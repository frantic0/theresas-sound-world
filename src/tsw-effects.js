/**********************************
 * Theresas's Sound World - Effects
 * tsw-effects.js
 * Dependencies: tsw-core.js
 * Copyright 2014 Stuart Memo
 **********************************/

(function (window, undefined) {
    'use strict';

    window.tsw = tsw || {};

    /*
     * Creates delay node.
     *
     * @method createDelay
     * @param {object} settings Delay settings.
     * @return {AudioNode} Created delay node.
     */
    tsw.delay = function (settings) {

        /*
         *  Delay effect
         *  ============
         *  +-------+         +----------+     +----------+
         *  | Input |---->----|   Delay  |-->--| Feedback |
         *  | (Osc) |         |  (Delay) |     |  (Gain)  |
         *  +-------+         +----------+     +----------+
         *      |                |   |              |
         *      v                v   +-----<--------+
         *      |                |   
         *   +---------------+   +--------------+        
         *   |     Output    |<--| Effect Level |
         *   | (Destination) |   |    (Gain)    |
         *   +---------------+   +--------------+
         *
         *  Config
         *  ------
         *  Delay Time: Number of seconds to delay signal
         *  Feedback: Volume of signal fed back into delay node
         *  Effect Level: Volume of effect mixed back into signal
         */

        var node = tsw.createNode(),
            delay = tsw.createDelay(),
            feedback = tsw.createGain(),
            effectLevel = tsw.createGain(),
            gain = tsw.createGain();

        node.settings = {
            delayTime: 0.5,
            feedback: 0.5,
            level: 0.5,
        };

        // Set values
        settings = settings || {};
        delay.delayTime.value =  settings.delayTime || node.settings.delayTime;
        feedback.gain.value = settings.feedback || node.settings.feedback;
        effectLevel.gain.value = settings.level || node.settings.level;

        tsw.connect(node.input, gain, delay, feedback, delay, effectLevel, node.output);
        tsw.connect(gain, delay);

        return node;
    };

    /*
     * Creates a distortion node.
     *
     * @method createDistortion
     * @param {object} settings Distortion settings.
     * @return Created distortion node.
     */
    tsw.distortion = function (settings) {

        /*
         *  Distortion
         *  ==========
         *  +----------+     +--------------+
         *  |  Input   |-->--|  Distortion  |
         *  | (Source) |     | (WaveShaper) |
         *  +----------+     +--------------+
         *                    |        | 
         *   +-----------------+   +-------------------+
         *   | Low-pass Filter |   |  High-pass Filter |
         *   |  (BiquadFilter) |   |   (BiquadFilter)  |
         *   +-----------------+   +-------------------+
         *                  |         |
         *               +---------------+
         *               |     Output    |
         *               | (Destination) |
         *               +---------------+
         *
         */

        var effect = {},
            distortion = tsw.context.createWaveShaper(),
            lowpass = tsw.context.createBiquadFilter(),
            highpass = tsw.context.createBiquadFilter();

        effect.settings = {
            distortionLevel: 0.5
        };

        // Set values
        settings = settings || {};

        effect.input = tsw.createGain();
        effect.output = tsw.createGain();

        tsw.connect(effect.input, distortion, [lowpass, highpass], effect.output);

        return effect;
    };

    /*
     * Creates a phaser node.
     *
     * @method createPhaser
     * @param {object} settings Phaser settings
     * @return {AudioNode} Created phaser node.
     */
    tsw.phaser = function (settings) {

        /****************************
        Phaser
        ======
        +----------+     +-----------------+               +-----------------+
        |  Input   |-->--| All-pass Filter |-->--(..n)-->--| All-pass Filter |
        | (Source) |     | (BiquadFilter)  |               |  (BiquadFilter) |
        +----------+     +-----------------+               +-----------------+
              |                |      |                           |
              v                v      Ê                           v 
        +---------------+      |      |                     +----------+
        |     Output    |---<--+      +----------<----------| Feedback |
        | (Destination) |                                   |  (Gain)  |
        +---------------+                                   +----------+

        Config
        ------
        Rate: The speed at which the filter changes
        Depth: The depth of the filter change
        Resonance: Strength of the filter effect
        *****************************/

        var effect = {},
            allPassFilters = [],
            feedback = tsw.createGain(),
            defaults  = {
                rate: 8,
                depth: 0.5,
                feedback: 0.8
            };

        // Set values
        settings = settings || {};

        feedback.gain.value = settings.gain || defaults.gain;

        for (var i = 0; i < defaults.rate; i++) {
            allPassFilters[i] = tsw.context.createBiquadFilter();
            allPassFilters[i].type = 7;
            allPassFilters[i].frequency.value = 100 * i;
        }

        effect.input = tsw.createGain();
        effect.output = tsw.createGain();

        for (var i = 0; i < allPassFilters.length - 1; i++) {
            tsw.connect(allPassFilters[i], allPassFilters[i + 1]);
        }

        tsw.connect(effect.input, allPassFilters[0], allPassFilters[allPassFilters.length - 1], feedback, allPassFilters[0]);
        tsw.connect(allPassFilters[allPassFilters.length - 1], effect.output);

        effect.setCutoff = function (c) {
            for (var i = 0; i < allPassFilters.length; i++) {
                // allPassFilters[i].frequency.value = c;
            }
        };

        return effect;
    };

    /*
     * Create a reverb node.
     *
     * @method createReverb
     * @param {object} settings Reverb settings.
     * @return {AudioNode} The created reverb node.
     */
    tsw.reverb = function (settings) {

        /***********************************

        Reverb
        ======
        +----------+         +-------------+
        |  Input   |---->----|   Reverb    |
        | (Source) |         | (Convolver) |
        +----------+         +-------------+
             |                      |
             v                      v
             |                      |
        +---------------+   +--------------+
        |     Output    |<--| Effect Level |
        | (Destination) |   |    (Gain)    |
        +---------------+   +--------------+

        Config
        ------
        Effect Level - Volume of effect
        Reverb Time - 
        Reverb Type - 
        Reverb Path - Path of impulse response file    

        ***********************************/

        var reverb = tsw.context.createConvolver(),
            effectLevel = tsw.createGain(),
            effectObj = {},
            defaults = {
                effectLevel: 0.5,
                reverbTime: 0.5,
                reverbType: 'spring',
                reverbPath: ''
            };

        // Set values
        settings = settings || {};
        effectLevel.gain.value = settings.effectLevel || defaults.effectLevel;

        tsw.load({
            'hall': '/effects/reverb/responses/bright-hall.wav',
            'room': '/effects/reverb/responses/medium-room.wav',
            'spring': '/effects/reverb/responses/feedback-spring.wav'
        }, function (buffers) {
            defaults.reverbPath = buffers[defaults.reverbType];
            reverb.buffer = defaults.reverbPath;

            effectObj.input = tsw.createGain();
            effectObj.output = tsw.createGain();

            tsw.connect(effectObj.input, [effectObj.output, reverb]);
            tsw.connect(reverb, effectLevel);
            tsw.connect(effectLevel, effectObj.output);

        });
        return effectObj;
    };

    /*
     * Creates tremolo node.
     *
     * @param {object} settings Tremolo settings.
     * @return {AudioNode} Created tremolo node.
     */
    tsw.tremolo = function (settings) {

        /******************************
        
        Tremolo
        =======
        +---------+     +-------------+
        |   LFO   |-->--|   Any Node  |
        |         |     | (Amplitude) |
        +---------+     +-------------+

        ******************************/

        var mmNode = {},
            config = {},
            tremolo = tsw.createGain(),
            lfo = this.createLFO(),
            that = this;

        settings = settings || {};

        mmNode.input = tsw.createGain();

        mmNode.connect = function (output) {
            mmNode.input.connect(output);
            lfo.modulate(mmNode.input.gain);
            lfo.start(that.now());
        };

        mmNode.setRate = function (r) {
            lfo.setFrequency(r);
        };

        mmNode.setDepth = function (r) {
            lfo.setDepth(r);
        };

        return mmNode;
    };

})(window);
