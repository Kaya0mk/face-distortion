let video;
let tracker;
let positions = [];
let stablePositions = [];
let videoWidth, videoHeight;
let offsetX, offsetY;

function setup() {
  // Video feed size: 1/3 of MacBook Air screen size (approx 2560x1600)
  videoWidth = Math.floor(windowWidth / 3);
  videoHeight = Math.floor(windowHeight / 3);

  // Center video feed on canvas
  offsetX = (width - videoWidth) / 2;
  offsetY = (height - videoHeight) / 2;

  // Create canvas
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // Video capture from webcam
  video = createCapture(VIDEO);
  video.size(videoWidth, videoHeight);
  video.hide();

  // Initialize clmtrackr
  tracker = new clm.tracker();
  tracker.init();
  tracker.start(video.elt);

  textSize(14);
  fill(0);
  noStroke();
}

function draw() {
  background(255);

  // Show video at the center and apply grayscale filter
  image(video, offsetX, offsetY, videoWidth, videoHeight);
  filter(GRAY);  // Black and white effect

  // Get current face positions
  positions = tracker.getCurrentPosition();

  if (positions && positions.length > 0) {
    // Save distorted face only every few frames to reduce flicker
    if (frameCount % 10 === 0) {
      stablePositions = JSON.parse(JSON.stringify(positions));  // Deep copy
      distortFace(stablePositions);
    }

    drawFeatureOutlines(stablePositions);
    displayMeasurements(stablePositions);
  } else {
    text("No face detected", 20, height - 20);
  }
}

function distortFace(pos) {
  for (let i = 0; i < pos.length; i++) {
    let [x, y] = pos[i];
    let scale = 1;

    if (i >= 27 && i <= 38) scale = random(0.95, 1.1); // Eyes
    else if (i >= 39 && i <= 42) scale = random(0.9, 1.2); // Nose
    else if (i >= 48 && i <= 59) scale = random(0.85, 1.25); // Mouth
    else if (i >= 0 && i <= 16)  scale = random(0.95, 1.1); // Face outline

    pos[i][0] = x * scale;
    pos[i][1] = y * scale;
  }
}

function drawFeatureOutlines(pos) {
  stroke(0); // Black outlines
  strokeWeight(2);
  noFill();

  beginShape();
  for (let i = 0; i < pos.length; i++) {
    vertex(pos[i][0] + offsetX, pos[i][1] + offsetY);  // Adjust coordinates for centered video
  }
  endShape(CLOSE);

  // Draw dots at landmarks
  for (let i = 0; i < pos.length; i++) {
    ellipse(pos[i][0] + offsetX, pos[i][1] + offsetY, 4, 4);  // Adjust coordinates for centered video
  }
}

function displayMeasurements(pos) {
  // Check if the positions array has enough points to access
  if (pos.length > 62) {
    let leftEye = pos[27];
    let rightEye = pos[32];
    let noseTip = pos[62];
    let eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);

    // Display eye distance and nose tip
    noStroke();
    fill(0);
    text(`Eye Distance: ${nf(eyeDist, 1, 2)} px`, 20, height - 40);
    text(`Nose Tip: (${int(noseTip[0])}, ${int(noseTip[1])})`, 20, height - 20);
  }
}

function windowResized() {
  // Resize canvas to window size
  resizeCanvas(windowWidth, windowHeight);
  // Recalculate offsets for centering the video
  offsetX = (width - videoWidth) / 2;
  offsetY = (height - videoHeight) / 2;
}
