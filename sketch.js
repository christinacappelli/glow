const CONFIDENCE_MAX = 0.25;

//STARS
var stars = [];
var speed;

// NOSE + THRESHOLD
let thresholdD = 450; // VARIABLE  big the glow circle is
let numNosesWithinThreshold = 0;
let noseDistThreshold = 100; // VARIABLE threshold dist between noses
let nosePositions = []; // array to store nose positions
let noseDistances = []; // variable is an array that stores the distances between all pairs of "close" noses.

// POSENET
let video; // video
let poseNet; // set up pose net
let pose; // variable for pose

// PARTICLES
let particles = [];
let counter = 0;
let glowTime = false; // assume glow is false
let glowStartTime = 0; // start glow time
let startTime;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // GET DEVICES + CAMERA
  navigator.mediaDevices.enumerateDevices().then(gotDevices);
  video = createCapture(VIDEO); // pose net video + ref needs
  video.size(width, height);

  video.hide(); // Hide or show  live video for tests

  //POSE NET
  poseNet = ml5.poseNet(video, modelLoaded); // ref+ argurments
  poseNet.on("pose", gotPoses); // find poses function

  //STARS
  for (var i = 0; i < 800; i++) {
    stars[i] = new Star();
  }
}

//GET ALL DEVICES
const devices = [];

//FUCNTION SETTING UP DEVICES
function gotDevices(deviceInfos) {
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.kind == "videoinput") {
      devices.push({
        label: deviceInfo.label,
        id: deviceInfo.deviceId,
      });
    }
  }
  console.log(devices);
  let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  //console.log(supportedConstraints);
  var constraints = {
    deviceId: {
      exact: devices[0].id,
    },
    video: true,
  };
}

//POSENET SET UP
function gotPoses(poses) {
  //console.log(poses);

  // if found a pose
  if (poses.length > 0) {
    pose = poses; // save all poses
    //pose = poses[0].pose; // this is saving one pose

    // clear the nose positions array
    nosePositions = [];

    // Calculate the average xy of all nose positions
    for (let i = 0; i < pose.length; i++) {
      let currentPose = pose[i].pose;

      // if confident there is a persons nose ..
      if (currentPose.score >= CONFIDENCE_MAX) {
        //let spot = ellipse(currentPose.nose.x, currentPose.nose.y, 10); //add spot for them

        particles.push(
          new Particle(currentPose.nose.x, currentPose.nose.y, 240)
        ); // draw particles out from that spot
        numNosesWithinThreshold++; // keep adding noses as you find them

        // add the nose position to the array
        nosePositions.push(
          createVector(currentPose.nose.x, currentPose.nose.y)
        );
      }
      //console.log(noseDistThreshold); // not changing
    }

    // calculate the distances between all pairs of noses
    noseDistances = [];
    for (let i = 0; i < nosePositions.length; i++) {
      for (let j = i + 1; j < nosePositions.length; j++) {
        let distBetweenNoses = nosePositions[i].dist(nosePositions[j]);
        if (distBetweenNoses < noseDistThreshold) {
          noseDistances.push(distBetweenNoses);
        }
      }
    }
  }
}

//POSENET REQUIRMENT
function modelLoaded() {
  //console.log("poseNet ready");
}

function draw() {
  background(0);

  // HELP FOR CODING - ADD PARTICLES FOR GLOW
  if (mouseIsPressed) {
    counter += 2;
  }
  counter = constrain(counter, 0, 1000);

  //MIRROR VIDEO
  translate(video.width, 1);
  scale(-1, 1);

  // VARIABLES FOR CENTER FOR GLOW
  let centerV = createVector(width / 2, height / 2);
  let numNoses = 0;

  // LOOK FOR NOSE POSITION
  if (pose) {
    // if there is a valid pose...

    // Calculate the average xy of all nose positions
    for (let i = 0; i < pose.length; i++) {
      let currentPose = pose[i].pose;

      // if confident there is a persons nose ..
      if (currentPose.score >= CONFIDENCE_MAX) {
        //let spot = ellipse(currentPose.nose.x, currentPose.nose.y, 10); //add spot for them

        particles.push(
          new Particle(currentPose.nose.x, currentPose.nose.y, 240)
        ); // draw particles out from that spot
        numNoses++; // keep adding noses as you find them
      }
    }

    // THE GLOW
    let glowTime = false; // assume glow is false

    if (numNoses >= 1) {
      // if you see enough ppl

      glowTime = true; // the glow is true

      // for all the ppl in view, find positions
      for (let i = 0; i < pose.length; i++) {
        let currentPose = pose[i].pose;

        // if confident its a person..
        if (currentPose.score >= CONFIDENCE_MAX) {
          let nosePos = createVector(currentPose.nose.x, currentPose.nose.y); // create a nose vector

          let distanceToCenter = nosePos.dist(centerV); // find distance to center (nose pos to center from the nose pos)

          //if that center is greater than threshold, not glow
          if (distanceToCenter > thresholdD) {
            glowTime = false; // not time to glow
          }
        }
      }
    }

    // COUNTER - if in glow zone, count up therwise count down
    if (glowTime) {
      counter++;
    } else {
      counter--;
    }
    //console.log(numNoses, counter); // noses + timer
    //console.log(counter);
  }

  // SHOW functions associated with the particles
  for (let i = particles.length - 1; i >= 0; i--) {
    let particle = particles[i];
    particle.update();
    particle.show();

    // if there are enough people
    if (counter > 250) {
      particle.glow(); // GLOW
      particle.lifespan -= 10;
    } else {
      particle.lifespan -= 7;
    }

    // stop particles if not enough people
    if (numNoses < 1) {
      particle.show();
    }

    if (particle.lifespan < 0) {
      particles.splice(i, 1);
    }
  }

  //CIRCLE for within threshold
  // stroke(255);
  // noFill();
  // strokeWeight(1);
  // circle(centerV.x, centerV.y, thresholdD * 2);

  //console.log(frameRate());
}

