let video;
let tracker;
let positions;
let distortionFactor = 1;

function setup() {
  createCanvas(640, 480);
  pixelDensity(1);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Initialize clmtrackr
  tracker = new clm.tracker();
  tracker.init();
  tracker.start(video.elt);

  textSize(12);
  fill(0, 255, 0);
  noStroke();
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);

  if (!tracker) {
    console.error("Tracker not initialized");
    return;
  }

  positions = tracker.getCurrentPosition();

  if (!positions || positions.length === 0) {
    text("Face not detected", 10, height - 10);
    return;
  }

  // Apply distortion before drawing
  distortFace(positions);

  drawFeatureOutlines();
  displayMeasurements();
}

function drawFeatureOutlines() {
  stroke(0, 255, 0);
  noFill();

  // Draw polygon connecting landmarks
  beginShape();
  for (let i = 0; i < positions.length; i++) {
    vertex(positions[i][0], positions[i][1]);
  }
  endShape(CLOSE);

  // Draw dots on facial landmarks
  for (let i = 0; i < positions.length; i++) {
    ellipse(positions[i][0], positions[i][1], 4, 4);
  }
}

function displayMeasurements() {
  let leftEye = positions[27];
  let rightEye = positions[32];
  let noseTip = positions[62];

  let eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);

  noStroke();
  fill(0, 255, 0);
  text(`Eye Distance: ${nf(eyeDist, 1, 2)} px`, 10, height - 20);
  text(`Nose Tip: (${int(noseTip[0])}, ${int(noseTip[1])})`, 10, height - 40);
}

function distortFace(pos) {
  for (let i = 0; i < pos.length; i++) {
    let x = pos[i][0];
    let y = pos[i][1];
    let scale = 1;

    // Distort different regions
    if (i >= 27 && i <= 32) scale = random(0.95, 1.1); // Eyes
    else if (i >= 33 && i <= 38) scale = random(0.95, 1.1); // Eyes (other)
    else if (i >= 39 && i <= 42) scale = random(0.9, 1.2); // Nose
    else if (i >= 48 && i <= 59) scale = random(0.8, 1.4); // Mouth
    else if (i >= 0 && i <= 16)  scale = random(0.95, 1.1); // Face outline

    pos[i][0] = x * scale;
    pos[i][1] = y * scale;
  }
}
