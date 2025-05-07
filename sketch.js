let video;
let tracker;
let positions = [];
let stablePositions = [];
let videoWidth, videoHeight;
let offsetX, offsetY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  videoWidth = int(windowWidth / 3 * 1.4);
  videoHeight = int(windowHeight / 3 * 1.4);

  video = createCapture(VIDEO);
  video.size(videoWidth, videoHeight);
  video.hide();

  tracker = new clm.tracker();
  tracker.init();
  tracker.start(video.elt);

  textSize(14);
  fill(255);
  noStroke();
}

function draw() {
  background(0);

  offsetX = (width - videoWidth) / 2;
  offsetY = (height - videoHeight) / 2;

  image(video, offsetX, offsetY, videoWidth, videoHeight);
  filter(GRAY);

  positions = tracker.getCurrentPosition();

  if (positions && positions.length > 0) {
    if (frameCount % 10 === 0) {
      stablePositions = JSON.parse(JSON.stringify(positions));
      distortFace(stablePositions);
    }

    drawFeatureOutlines(stablePositions);
    displayMeasurements(stablePositions);
  } else {
    text("No face detected", offsetX + 10, offsetY + videoHeight - 10);
  }
}

function distortFace(pos) {
  for (let i = 0; i < pos.length; i++) {
    let [x, y] = pos[i];
    let scale = 1;

    if (i >= 27 && i <= 38) scale = random(0.95, 1.1);
    else if (i >= 39 && i <= 42) scale = random(0.9, 1.2);
    else if (i >= 48 && i <= 59) scale = random(0.85, 1.25);
    else if (i >= 0 && i <= 16)  scale = random(0.95, 1.1);

    pos[i][0] = x * scale;
    pos[i][1] = y * scale;
  }
}

function drawFeatureOutlines(pos) {
  stroke(255);
  strokeWeight(0.5); // EVEN THINNER lines
  noFill();

  beginShape();
  for (let i = 0; i < pos.length; i++) {
    vertex(pos[i][0] + offsetX, pos[i][1] + offsetY);
  }
  endShape(CLOSE);

  for (let i = 0; i < pos.length; i++) {
    ellipse(pos[i][0] + offsetX, pos[i][1] + offsetY, 1.5, 1.5); // Smaller dots
  }
}

function displayMeasurements(pos) {
  if (!pos[27] || !pos[32] || !pos[62] || !pos[48] || !pos[54]) return;

  let leftEye = pos[27];
  let rightEye = pos[32];
  let noseTip = pos[62];
  let leftMouth = pos[48];
  let rightMouth = pos[54];

  let eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);
  let mouthWidth = dist(leftMouth[0], leftMouth[1], rightMouth[0], rightMouth[1]);

  noStroke();
  fill(255);
  text(`Eye Distance: ${nf(eyeDist, 1, 2)} px`, offsetX + 10, offsetY + videoHeight + 20);
  text(`Nose Tip: (${int(noseTip[0])}, ${int(noseTip[1])})`, offsetX + 10, offsetY + videoHeight + 40);
  text(`Mouth Width: ${nf(mouthWidth, 1, 2)} px`, offsetX + 10, offsetY + videoHeight + 60);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
