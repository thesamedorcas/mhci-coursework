var start_beta  = 0; 
var start_gamma = 0;
var readings = [];
var done     = false;
//ask iphone for permission to access motion sensors, then start the app
function onStartButton() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then(function(result) {
      if (result === 'granted') getReady();
    });
  } else {
    getReady();
  }
}

function goToScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

//filled readings array with sensor data for 3 seconds, then calculates the average beta and gamma to use as the starting point for the app
function getReady() {
  readings = [];
  done     = false;
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
    start_beta  = total_b / readings.length;
    start_gamma = total_g / readings.length;
  }
  goToScreen('main-screen');
}

//sensor values 
function onTilt(e) {
  console.log('beta:', e.beta, 'gamma:', e.gamma);
}

window.addEventListener('deviceorientation', onTilt);