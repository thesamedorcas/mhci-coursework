var start_beta = 0;
var start_gamma = 0;
var readings = [];
var done = false;
var current_b = 0;
var current_g = 0;
var max_tilt = 50;
var threshold = 12;
var smoothing = 0.05;

//ask iphone for permission to access motion sensors, then start the app
function onStartButton() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(function (result) {
            if (result === 'granted') getReady();
        });
    } else {
        getReady();
    }
}

function goToScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) {
        s.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}

//filled readings array with sensor data for 3 seconds, then calculates the average beta and gamma to use as the starting point for the app
function getReady() {
    readings = [];
    done = false;
    var t0 = Date.now();

    function onSample(e) {
        if (e.beta == null) return;
        readings.push({ b: e.beta, g: e.gamma });
        if (Date.now() - t0 >= 3000) {
            window.removeEventListener('deviceorientation', onSample);
            doneCalibrating();
        }
    }

    window.addEventListener('deviceorientation', onSample);
}
function doneCalibrating() {
    if (done) return;
    done = true;

    if (readings.length > 0) {
        var total_b = 0, total_g = 0;
        for (var i = 0; i < readings.length; i++) {
            total_b += readings[i].b;
            total_g += readings[i].g;
        }
        start_beta = total_b / readings.length;
        start_gamma = total_g / readings.length;
    }
    goToScreen('main-screen');
}
function onTilt(e) {
    if (e.beta == null) return;
    var gamma = e.gamma - start_gamma;
    var beta = e.beta - start_beta;
    current_b += smoothing * (beta - current_b);
    current_g += smoothing * (gamma - current_g);
    // lots of math like if you don't tilt much, don't do anything
    if (Math.abs(current_b) < threshold && Math.abs(current_g) < threshold) {
        return;
    }
    //which row and column the tilt points to
    var col = tiltToIndex(current_g, 3);
    var row = tiltToIndex(current_b, 2);
    console.log('row:', row, 'col:', col);
}
function tiltToIndex(angle, count) {
    var n = Math.max(-1, Math.min(1, angle / max_tilt));
    return Math.min(count - 1, Math.max(0, Math.floor((n + 1) / 2 * count)));
}
window.addEventListener('deviceorientation', onTilt);