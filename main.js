var start_beta = 0;
var start_gamma = 0;
var readings = [];
var done = false;
var current_b = 0;
var current_g = 0;
var max_tilt = 50;
var threshold = 12;
var smoothing = 0.05;
var active_button = -1;
var hold_timer = null;
var hold_time = 2000;
var anim_frame = null;
var hold_start = null;
var eval_on = false;
var target_btn = -1;
var round_num = 0;
var round_start = null;
var num_correct = 0;
var num_wrong = 0;
var all_times = [];
var num_rounds = 10;
var is_activating = false; //added this cos i keep seeing a bug where the button isn't green?
var speed_settings = [
    { max_tilt: 60, hold_time: 3000, smoothing: 0.03 },
    { max_tilt: 50, hold_time: 2000, smoothing: 0.05 },
    { max_tilt: 40, hold_time: 1500, smoothing: 0.07 },
    { max_tilt: 30, hold_time: 1000, smoothing: 0.09 },
    { max_tilt: 20, hold_time: 500, smoothing: 0.11 },
];
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
    updateHighlight(row * 3 + col);
}
function tiltToIndex(angle, count) {
    var n = Math.max(-1, Math.min(1, angle / max_tilt));
    return Math.min(count - 1, Math.max(0, Math.floor((n + 1) / 2 * count)));
}
function updateHighlight(idx) {
    if (is_activating) return;
    if (idx === active_button) return;
    clearTimeout(hold_timer);
    cancelAnimationFrame(anim_frame);
    if (active_button >= 0) {
        var old = document.getElementById('button-' + active_button);
        if (old) {
            old.classList.remove('highlighted');
            setFill(old, 0);
        }
    }
    active_button = idx;
    if (idx < 0) return;
    var cell = document.getElementById('button-' + idx);
    if (cell) cell.classList.add('highlighted');
    hold_start = Date.now();
    startFill(cell);
    hold_timer = setTimeout(function () { buttonSelected(idx); }, hold_time);
    document.getElementById('status-text').textContent = 'Keep steady...';
}
function buttonSelected(idx) {
    var cell = document.getElementById('button-' + idx);
    if (!cell) return;
    cancelAnimationFrame(anim_frame);
    is_activating = true;
    for (var i = 0; i < 6; i++) {
        var c = document.getElementById('button-' + i);
        if (c) {
            c.classList.remove('highlighted');
            c.classList.remove('activated');
            setFill(c, 0);
        }
    }
    cell.classList.add('activated');
    setFill(cell, 1);
    document.getElementById('status-text').textContent = 'Button ' + (idx + 1) + ' selected!';
    if (eval_on) logResult(idx);
    setTimeout(function () {
        cell.classList.remove('activated');
        setFill(cell, 0);
        active_button = -1;
        is_activating = false;
        if (eval_on) newRound();
        else document.getElementById('status-text').textContent = 'Tilt to a button, keep steady to select';
    }, 1000);
}
function startFill(cell) {
    function tick() {
        if (!hold_start) return;
        var progress = Math.min(1, (Date.now() - hold_start) / hold_time);
        setFill(cell, progress);
        if (progress < 1) anim_frame = requestAnimationFrame(tick);
    }
    anim_frame = requestAnimationFrame(tick);
}
function setFill(cell, progress) {
    var fill = cell.querySelector('.button-fill');
    if (fill) fill.style.height = (progress * 100) + '%';
}
function changeSpeed() {
    var level = parseInt(document.getElementById('speed-select').value) - 1;
    max_tilt = speed_settings[level].max_tilt;
    hold_time = speed_settings[level].hold_time;
    smoothing = speed_settings[level].smoothing;
}
function onEvalButton() {
    if (eval_on) {
        stopEval();
    } else {
        beginEval();
    }
}

function beginEval() {
    eval_on = true;
    num_correct = 0;
    num_wrong = 0;
    all_times = [];
    round_num = 0;
    document.getElementById('eval-btn').textContent = 'Stop Evaluation';
    document.getElementById('eval-btn').classList.add('stop');
    document.getElementById('eval-stats').style.display = 'block';
    updateStats();
    newRound();
}

function stopEval() {
    eval_on = false;
    document.getElementById('eval-btn').textContent = 'Start Evaluation';
    document.getElementById('eval-btn').classList.remove('stop');
    document.getElementById('eval-stats').style.display = 'none';
    clearTarget();
    document.getElementById('status-text').textContent = 'Tilt to a button, keep steady to select';
    displayResults();
}

function newRound() {
    if (round_num >= num_rounds) { stopEval(); return; }
    var last = target_btn;
    do { target_btn = Math.floor(Math.random() * 6); } while (target_btn === last);
    clearTarget();
    document.getElementById('button-' + target_btn).classList.add('target');
    round_start = Date.now();
    round_num++;
    var label = document.getElementById('button-' + target_btn).querySelector('.button-label').textContent;
    document.getElementById('status-text').textContent = 'Select button ' + label + ' (' + round_num + '/' + num_rounds + ')';
}

function logResult(picked) {
    var t = (Date.now() - round_start) / 1000;
    all_times.push(t);
    if (picked === target_btn) num_correct++;
    else num_wrong++;
    updateStats();
}

function updateStats() {
    document.getElementById('stat-correct').textContent = num_correct;
    document.getElementById('stat-wrong').textContent = num_wrong;
    var avg = all_times.length
        ? (all_times.reduce(function (a, b) { return a + b; }, 0) / all_times.length).toFixed(1)
        : '-';
    document.getElementById('stat-time').textContent = avg;
}

function clearTarget() {
    for (var i = 0; i < 6; i++) {
        var c = document.getElementById('button-' + i);
        if (c) c.classList.remove('target');
    }
}
window.addEventListener('deviceorientation', onTilt);
function displayResults() {
    var acc = all_times.length
        ? Math.round((num_correct / all_times.length) * 100) + '%'
        : 'N/A';
    var avg = all_times.length
        ? (all_times.reduce(function (a, b) { return a + b; }, 0) / all_times.length).toFixed(1) + 's'
        : 'N/A';
    document.getElementById('results-text').innerHTML =
        'Rounds: ' + all_times.length + '<br>' +
        'Correct: ' + num_correct + '&nbsp;&nbsp;Wrong: ' + num_wrong + '<br>' +
        'Accuracy: ' + acc + '<br>' +
        'Avg time: ' + avg;
    document.getElementById('results-popup').style.display = 'flex';
}

function hideResults() {
    document.getElementById('results-popup').style.display = 'none';
}