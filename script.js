const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/face-detection-cam/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/face-detection-cam/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/face-detection-cam/models')
]).then(startVideo)

function startVideo() {
  // navigator.mediaDevices.getUserMedia(
  //   { video: {} },
  //   stream => video.srcObject = stream,
  //   err => console.error(err)
  // )
  navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
    getUserMedia: function(c) {
      return new Promise(function(y, n) {
        (navigator.mozGetUserMedia ||
         navigator.webkitGetUserMedia).call(navigator, c, y, n);
      });
    }
  } : null);
  
  if (!navigator.mediaDevices) {
    console.log("getUserMedia() not supported.");
    return;
  }
  
  // Prefer camera resolution nearest to 1280x720.
  
  var constraints = { audio: false, video: { width: 1280, height: 720 } };
  
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    video.srcObject = stream
    video.onloadedmetadata = function(e) {
      video.play();
    };
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });
  
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  let displaySize = null;
  if(window.screen.width >= 720) {
    displaySize = { width: video.width, height: video.height }
  } else {
    displaySize = { width: window.screen.width, height: video.height }
  }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})