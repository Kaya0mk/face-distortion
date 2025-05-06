let video;
let tracker;
let positions;
let distortionFactor = 1;
let stablePositions = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  tracker = new clm.tracker();
  tracker.init();
  tracker.start(video.elt);

  textSize(14);
  fill(0);
  noStroke();
}

function draw() {
  background(255);
  image(video, 0, 0, width, height);
  filter(GRAY); // Black and white effect

  if (!tracker) return;

  positions = tracker.getCurrentPosition();

  if (!positions || positions.length === 0) {
    text("No face detected", 20, height - 20);
    return;
  }

  // Save distorted version only once for smoother visuals
  if (frameCount % 10 === 0) {
    stablePositions = JSON.parse(JSON.stringify(positions)); // Deep copy
    distortFace(stablePositions);
  }

  drawFeatureOutlines(stablePositions);
  displayMeasurements(stablePositions);
}

function drawFeatureOutlines(pos) {
  stroke(0); // Black outlines
  strokeWeight(2);
  noFill();

  beginShape();
  for (let i = 0; i < pos.length; i++) {
    vertex(pos[i][0], pos[i][1]);
  }
  endShape(CLOSE);

  for (let i = 0; i < pos.length; i++) {
    ellipse(pos[i][0], pos[i][1], 4, 4);
  }
}

function displayMeasurements(pos) {
  let leftEye = pos[27];
  let rightEye = pos[32];
  let noseTip = pos[62];
  let eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);

  noStroke();
  fill(0);
  text(`Eye Distance: ${nf(eyeDist, 1, 2)} px`, 20, height - 40);
  text(`Nose Tip: (${int(noseTip[0])}, ${int(noseTip[1])})`, 20, height - 20);
}

function distortFace(pos) {
  for (let i = 0; i < pos.length; i++) {
    let x = pos[i][0];
    let y = pos[i][1];
    let scale = 1;

    if (i >= 27 && i <= 38) scale = random(0.95, 1.1); // Eyes
    else if (i >= 39 && i <= 42) scale = random(0.9, 1.2); // Nose
    else if (i >= 48 && i <= 59) scale = random(0.85, 1.25); // Mouth
    else if (i >= 0 && i <= 16)  scale = random(0.95, 1.1); // Face outline

    pos[i][0] = x * scale;
    pos[i][1] = y * scale;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
