/***********************************
 * Theresas's Sound World - Analysis
 * tsw-analysis.js
 * Copyright 2014 Stuart Memo
 **********************************/

'use strict';

var tsw = require('./tsw-core');

var getDuration = function (timeInSeconds) {
    var minutes = Math.floor(timeInSeconds / 60);

    return {
        minutes: minutes,
        seconds: timeInSeconds - (minutes * 60),
        totalSeconds: timeInSeconds
    };
};

tsw.analyser = function () {
    var analyser = tsw.context().createAnalyser();

    return analyser;
};

tsw.info = function (file) {
    return {
        duration: getDuration(file.duration),
        numberOfChannels: file.numberOfChannels,
        sampleRate: file.sampleRate
    };
};

module.exports = tsw;
