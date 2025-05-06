let video;
let tracker;
let positions;

function setup() {
  createCanvas(640, 480);
  pixelDensity(1); // Ensures pixelated effect
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
  loadPixels(); // For pixel manipulation if needed

  positions = tracker.getCurrentPosition();

  if (positions && positions.length > 0) {
    drawFeatureOutlines();
    displayMeasurements();
  }
}

function drawFeatureOutlines() {
  stroke(0, 255, 0);
  noFill();

  // Draw lines connecting facial landmarks
  beginShape();
  for (let i = 0; i < positions.length; i++) {
    vertex(positions[i][0], positions[i][1]);
  }
  endShape(CLOSE);

  // Draw points at each landmark
  for (let i = 0; i < positions.length; i++) {
    ellipse(positions[i][0], positions[i][1], 4, 4);
  }
}

function displayMeasurements() {
  // Example: Distance between eyes (points 27 and 32)
  let leftEye = positions[27];
  let rightEye = positions[32];
  let eyeDistance = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);

  // Display eye distance
  noStroke();
  fill(0, 255, 0);
  text(`Eye Distance: ${nf(eyeDistance, 1, 2)} px`, 10, height - 20);

  // Display coordinates of the nose tip (point 62)
  let noseTip = positions[62];
  text(`Nose Tip: (${int(noseTip[0])}, ${int(noseTip[1])})`, 10, height - 40);
}
