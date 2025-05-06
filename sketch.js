let video;
let tracker;
let distortionFactor = 1;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Wait for the library to load before initializing tracker
  setTimeout(() => {
    if (typeof clmtrackr === 'undefined') {
      console.error('clmtrackr library not loaded!');
      return;
    }

    // Initialize the clmtracker
    tracker = new clm.tracker();
    tracker.init();
    tracker.start(video.elt);
  }, 1000); // Delay of 1 second to make sure the library has loaded
}

function draw() {
  background(0);
  image(video, 0, 0);

  if (!tracker) {
    console.error('Tracker is not initialized!');
    return;
  }

  let currentPositions = tracker.getCurrentPosition();

  // Ensure the currentPositions is valid
  if (!currentPositions || currentPositions.length === 0) {
    console.error('No face detected or tracker not working!');
    return;
  }

  // Apply random distortions to facial features
  distortFace(currentPositions);

  // Draw the distorted face
  noFill();
  stroke(0, 255, 100);
  strokeWeight(2);
  beginShape();

  // Draw all the landmarks with random distortion applied
  for (let i = 0; i < currentPositions.length; i++) {
    let [x, y] = currentPositions[i];
    let dx = random(-distortionFactor, distortionFactor);
    let dy = random(-distortionFactor, distortionFactor);
    vertex(x + dx, y + dy);
  }

  endShape(CLOSE);
}

function distortFace(currentPositions) {
  // Randomly distort eyes, nose, mouth, and face outline
  for (let i = 0; i < currentPositions.length; i++) {
    let [x, y] = currentPositions[i];

    // Apply distortions only to valid landmarks (checking for index range)
    if (i >= 27 && i <= 32) {
      let scaleFactor = random(0.9, 1.2);  // Eyes randomly scale
      currentPositions[i][0] = x * scaleFactor;
      currentPositions[i][1] = y * scaleFactor;
    } else if (i >= 33 && i <= 38) {
      let scaleFactor = random(0.9, 1.2);  // Eyes randomly scale
      currentPositions[i][0] = x * scaleFactor;
      currentPositions[i][1] = y * scaleFactor;
    }

    // Distort nose (indices: 39-42)
    if (i >= 39 && i <= 42) {
      let scaleFactor = random(0.9, 1.3);  // Nose randomly scales
      currentPositions[i][0] = x * scaleFactor;
      currentPositions[i][1] = y * scaleFactor;
    }

    // Distort mouth (indices: 48-59)
    if (i >= 48 && i <= 59) {
      let scaleFactor = random(0.8, 1.4);  // Mouth randomly scales
      currentPositions[i][0] = x * scaleFactor;
      currentPositions[i][1] = y * scaleFactor;
    }

    // Distort face outline (indices: 0-16)
    if (i >= 0 && i <= 16) {
      let scaleFactor = random(0.9, 1.1);  // Face outline randomly scales
      currentPositions[i][0] = x * scaleFactor;
      currentPositions[i][1] = y * scaleFactor;
    }
  }
}
