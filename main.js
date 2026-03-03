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

// empty for now 
function getReady() {
  goToScreen('main-screen');
}

//sensor values 
function onTilt(e) {
  console.log('beta:', e.beta, 'gamma:', e.gamma);
}

window.addEventListener('deviceorientation', onTilt);