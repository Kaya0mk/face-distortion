let video;
let faceapi;
let detections = [];
let hands;
let canvasElement;
let canvasCtx;

function setup() {
  canvasElement = createCanvas(windowWidth * 0.4, windowHeight * 0.4);
  canvasCtx = canvasElement.elt.getContext('2d');
  canvasElement.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  background(0);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  const faceOptions = { withLandmarks: true, withExpressions: true, minConfidence: 0.5 };
  faceapi = ml5.faceApi(video, faceOptions, () => console.log("FaceAPI ready"));
  faceapi.detect(gotFaces);

  hands = new Hands({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });
  hands.onResults(onHandsResults);

  const camera = new Camera(video.elt, {
    onFrame: async () => await hands.send({ image: video.elt }),
    width: width,
    height: height
  });
  camera.start();
}

function gotFaces(err, result) {
  if (err) return console.error(err);
  detections = result;
  faceapi.detect(gotFaces);
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
  noFill();
  stroke(255);
  strokeWeight(0.5);

  if (detections.length > 0) {
    const parts = detections[0].parts;
    drawPart(parts.nose, true);
    drawPart(parts.leftEye, true);
    drawPart(parts.rightEye, true);
    drawPart(parts.mouth, true);
    drawMeasurements(parts);
    drawExpression(detections[0].expressions);
  }
}

function drawPart(feature, closed) {
  beginShape();
  for (let pt of feature) vertex(pt._x, pt._y);
  if (closed) endShape(CLOSE);
  else endShape();
}

function drawMeasurements(parts) {
  const leftEye = parts.leftEye[0];
  const rightEye = parts.rightEye[3];
  const eyeDist = dist(leftEye._x, leftEye._y, rightEye._x, rightEye._y);
  const nose = parts.nose[3];
  fill(255);
  noStroke();
  textSize(8);
  text(`Eye distance: ${eyeDist.toFixed(1)} px`, 10, height - 25);
  text(`Nose tip at: (${nose._x.toFixed(1)}, ${nose._y.toFixed(1)})`, 10, height - 15);
}

function drawExpression(expressions) {
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  let emoji = "";
  if (primary === "happy") emoji = ":)";
  else if (primary === "sad") emoji = ":(";
  else if (primary === "angry") emoji = ">:(";
  fill(255);
  textSize(8);
  text(`Expression: ${primary} ${emoji}`, 10, height - 35);
}

function onHandsResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    for (let landmarks of results.multiHandLandmarks) {
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#FFFFFF', lineWidth: 1 });
      drawLandmarks(canvasCtx, landmarks, { color: '#FFFFFF', lineWidth: 0.5 });
      // Example: distance between index tip (8) and thumb tip (4)
      let d = dist(
        landmarks[4].x * width,
        landmarks[4].y * height,
        landmarks[8].x * width,
        landmarks[8].y * height
      );
      fill(255);
      textSize(8);
      text(`Thumb-Index dist: ${d.toFixed(1)} px`, 10, height - 45);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth * 0.4, windowHeight * 0.4);
  canvasElement.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}
