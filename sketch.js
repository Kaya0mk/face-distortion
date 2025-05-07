let video;
let hands;
let canvasElement;
let canvasCtx;

function setup() {
  createCanvas(640, 480);
  canvasElement = createCanvas(640, 480);
  canvasCtx = canvasElement.elt.getContext('2d');

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(onResults);

  const camera = new Camera(video.elt, {
    onFrame: async () => {
      await hands.send({ image: video.elt });
    },
    width: 640,
    height: 480
  });
  camera.start();
}

function onResults(results) {
  background(0);
  image(video, 0, 0, width, height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (let landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
      drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });

      // Calculate distance between thumb tip (landmark 4) and index finger tip (landmark 8)
      let thumbTip = landmarks[4];
      let indexTip = landmarks[8];

      let dx = (thumbTip.x - indexTip.x) * width;
      let dy = (thumbTip.y - indexTip.y) * height;
      let distance = Math.sqrt(dx * dx + dy * dy);

      fill(255);
      noStroke();
      textSize(16);
      text(`Thumb-Index Distance: ${distance.toFixed(2)} px`, 10, height - 10);
    }
  }
}

function draw() {
  // The drawing is handled in onResults
}
