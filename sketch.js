let video;
let tracker;
let positions = [];
let stablePositions = [];
let offsetX, offsetY;
let videoWidth, videoHeight;

let status = "real"; // Default status
let statusChangeTimer = 0; // Timer to control the "real"/"not real" change

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  // Video dimensions (MacBook Air screen is ~1440px wide → ~480x360 is 1/3 size)
  videoWidth = 480;
  videoHeight = 360;

  video = createCapture(VIDEO);
  video.size(videoWidth, videoHeight);
  video.hide();

  tracker = new clm.tracker();
  tracker.init();
  tracker.start(video.elt);

  textSize(7); // Smaller text for debug info
  fill(255);
  noStroke();
}

function draw() {
  background(0);
  offsetX = (width - videoWidth) / 2;
  offsetY = (height - videoHeight) / 2;

  image(video, offsetX, offsetY, videoWidth, videoHeight);
  filter(GRAY); // Black & white

  positions = tracker.getCurrentPosition();

  if (positions && positions.length > 0) {
    if (frameCount % 10 === 0) {
      stablePositions = JSON.parse(JSON.stringify(positions));
      distortFace(stablePositions);
    }

    drawFeatureOutlines(stablePositions);
    displayMeasurements(stablePositions);
  } else {
    fill(255);
    text("No face detected", offsetX + 10, offsetY + videoHeight + 20);
  }
}

function distortFace(pos) {
  for (let i = 0; i < pos.length; i++) {
    let [x, y] = pos[i];
    let scale = 1;

    if (i >= 27 && i <= 38) scale = random(0.95, 1.1); // Eyes
    else if (i >= 39 && i <= 42) scale = random(0.9, 1.2); // Nose
    else if (i >= 48 && i <= 59) scale = random(0.85, 1.25); // Mouth
    else if (i >= 0 && i <= 16) scale = random(0.95, 1.1); // Face outline

    pos[i][0] = x * scale;
    pos[i][1] = y * scale;
  }
}

function drawFeatureOutlines(pos) {
  stroke(255);
  strokeWeight(0.5); // SUPER thin lines
  noFill();

  beginShape();
  for (let i = 0; i < pos.length; i++) {
    vertex(offsetX + pos[i][0], offsetY + pos[i][1]);
  }
  endShape(CLOSE);

  for (let i = 0; i < pos.length; i++) {
    ellipse(offsetX + pos[i][0], offsetY + pos[i][1], 2, 2); // smaller circles
  }
}

function displayMeasurements(pos) {
  if (!pos[27] || !pos[32] || !pos[62] || !pos[48] || !pos[54] || !pos[57] || !pos[60]) return;

  let leftEye = pos[27];
  let rightEye = pos[32];
  let noseTip = pos[62];
  let leftMouth = pos[48];
  let rightMouth = pos[54];
  let topLip = pos[60];
  let bottomLip = pos[57];

  let eyeDist = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]);
  let mouthWidth = dist(leftMouth[0], leftMouth[1], rightMouth[0], rightMouth[1]);
  let mouthOpen = dist(topLip[1], topLip[0], bottomLip[1], bottomLip[0]);

  let mouthCurve = rightMouth[1] - leftMouth[1];
  let expression = ":|"; // Neutral

  if (mouthWidth > 50 && mouthCurve < -3) {
    expression = ":)";
  } else if (mouthWidth < 40 && mouthCurve > 3) {
    expression = ":(";
  }

  // Update status: "real" or "not real"
  if (statusChangeTimer <= 0) {
    // 80% chance to display "real"
    if (random() < 0.8) {
      status = "real";
    } else {
      status = "not real";
    }

    // Set a timer for how long the status stays the same
    statusChangeTimer = random(200, 300); // Stay in current status for 200-300 frames
  } else {
    statusChangeTimer--; // Decrease the timer
  }

  // 💬 Draw the "real" or "not real" status above the face (floating above forehead)
  let foreheadY = (pos[19][1] + pos[24][1]) / 2; // Midway between the eyes/forehead
  let statusX = offsetX + (leftEye[0] + rightEye[0]) / 2;
  let statusY = offsetY + foreheadY - 50; // Position above the face

  // Display "real" or "not real" text with a 15% larger size
  textSize(8); // Slightly larger text for "real"/"not real"
  fill(255);
  textAlign(CENTER, CENTER);
  text(status, statusX, statusY); // Display status above face

  // Connecting line from status to face (align with face width)
  stroke(255);
  strokeWeight(0.5);
  line(statusX, statusY + 5, statusX, offsetY + pos[19][1] - 5); // Draw a line from status to face
  
  // 📊 Display debug info under video
  textAlign(LEFT, BASELINE);
  let y = offsetY + videoHeight + 20;
  textSize(7); // Smaller text size for debug info
  text(`Eye Distance: ${nf(eyeDist, 1, 2)} px`, offsetX + 10, y);
  text(`Nose Tip: (${int(noseTip[0])}, ${int(noseTip[1])})`, offsetX + 10, y + 10);
  text(`Mouth Width: ${nf(mouthWidth, 1, 2)} px`, offsetX + 10, y + 20);
  text(`Expression: ${expression}`, offsetX + 10, y + 30);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
