"use strict";
const $target = $(".target");
const targetOuter = document.querySelector(".targetOuter");
const targetInner = document.querySelector(".targetInner");
const timer = document.querySelector(".timer");
const playScene = document.querySelector(".playScene");
const resultScene = document.querySelector(".resultScene");
const showBulletholes = document.querySelector(".showBulletholes");
let avgPosXOfShot = 0;
let avgPosYOfShot = 0;
let timelimit = 0;
let windowWidth = 0,
  windowHeight = 0;
const scores = [0, 0, 0, 0, 0]; //0.totalshots,1.Great,2.Good,3.Hit,4.Score
const addScore = {
  great: function () {
    showGainedPoint("great", "+2");
    scores[0] += 1;
    scores[1] += 1;
    scores[3] += 1;
    scores[4] += 2;
    writeScores();
  },
  good: function () {
    showGainedPoint("good", "+1");
    scores[0] += 1;
    scores[2] += 1;
    scores[3] += 1;
    scores[4] += 1;
    writeScores();
  },
  miss: function () {
    showGainedPoint("miss", "-2");
    scores[0] += 1;
    scores[4] -= 2;
    writeScores();
  },
};
window.onload = window.onresize = function () {
  this.document.querySelector(".currentWidth").innerText = window.innerWidth;
  this.document.querySelector(".currentHeight").innerText = window.innerHeight;
};

document.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

document.addEventListener("keydown", function (event) {
  if (event.keyCode === 27) {
    backToStartScene();
  }
});

document
  .querySelector(".toChallenge")
  .setAttribute("href", `http://${location.host}/challenge/`);

document
  .querySelector(".setWindowSizeBtn")
  .addEventListener("click", function () {
    document.querySelector(".setWidth").value = window.innerWidth;
    document.querySelector(".setHeight").value = window.innerHeight;
  });

document.querySelector(".startBtn").addEventListener("click", function () {
  initialize();
  setDisplayValue("none", "block", "none");
});

document.querySelector(".retryBtn").addEventListener("click", function () {
  initialize();
  setDisplayValue("none", "block", "none");
});

document
  .querySelector(".backToStartSceneBtn")
  .addEventListener("click", backToStartScene);

targetOuter.addEventListener("mousedown", function (_event) {
  if (_event.button !== 0) return false;
  moveTarget();
  addScore.good();
  playSE("./sound/targetOuter.mp3");
  addBullethole(_event, "targetOuter");
});

targetInner.addEventListener("mousedown", function (_event) {
  if (_event.button !== 0) return false;
  moveTarget();
  addScore.great();
  playSE("./sound/targetInner.mp3");
  addBullethole(_event, "targetInner");
});

document
  .querySelector(".playSceneBackground")
  .addEventListener("mousedown", function (_event) {
    if (_event.button !== 0) return false;
    addScore.miss();
    playSE("./sound/missShoot.mp3");
  });

const showAvgBullethole = document.querySelector(".showAvgBullethole");
showAvgBullethole.addEventListener("click", function () {
  if (showAvgBullethole.checked) {
    document.querySelector(".avgBullethole").style.display = "block";
  } else {
    document.querySelector(".avgBullethole").style.display = "none";
  }
});

function initialize() {
  setDiameter();
  $target.css({ top: "50%", left: "50%" });
  windowWidth = document.querySelector(".setWidth").value;
  windowHeight = document.querySelector(".setHeight").value;
  playScene.style.width = `${windowWidth}px`;
  playScene.style.height = `${windowHeight}px`;
  avgPosXOfShot = 0;
  avgPosYOfShot = 0;
  clearInterval(countDownIntervalId);
  timelimit = document.querySelector(".setTimelimit").value;
  timer.innerHTML = timelimit;
  $target.off("mousedown");
  $target.one("mousedown", function () {
    countDownTimer();
  });
  while (document.querySelector(".bullethole") !== null) {
    document.querySelector(".bullethole").remove();
  }
  while (document.querySelector(".avgBullethole") !== null) {
    document.querySelector(".avgBullethole").remove();
  }
  for (let i = 0; i < scores.length; i++) {
    scores[i] = 0;
  }
  writeScores();
}

function setDiameter() {
  const diameter = document.querySelector(".setDiameter").value;
  $target.css({ width: diameter, height: diameter });
  showBulletholes.setAttribute(
    "style",
    `width: ${diameter}px; height: ${diameter}px;`
  );
}

function writeScores() {
  const totalShots = document.querySelectorAll(".totalShots");
  const greatShots = document.querySelectorAll(".greatShots");
  const goodShots = document.querySelectorAll(".goodShots");
  const hitShots = document.querySelectorAll(".hitShots");
  const totalScore = document.querySelectorAll(".totalScore");
  const greatPercentage = document.querySelectorAll(".greatPercentage");
  const goodPercentage = document.querySelectorAll(".goodPercentage");
  const accuracy = document.querySelectorAll(".accuracy");
  for (let i = 0; i < totalShots.length; i++) {
    totalShots[i].innerHTML = scores[0];
    greatShots[i].innerHTML = scores[1];
    goodShots[i].innerHTML = scores[2];
    hitShots[i].innerHTML = scores[3];
    totalScore[i].innerHTML = scores[4];
    greatPercentage[i].innerHTML = ((scores[1] / scores[3]) * 100).toFixed(1);
    goodPercentage[i].innerHTML = ((scores[2] / scores[3]) * 100).toFixed(1);
    accuracy[i].innerHTML = ((scores[3] / scores[0]) * 100).toFixed(1);
  }
}

function showGainedPoint(_eval, _score) {
  const $gainedPoint = $(".gainedPoint");
  $gainedPoint.text(_score);
  $gainedPoint.finish();
  $gainedPoint.addClass("gainedPoint--" + _eval);
  $gainedPoint.fadeIn(400, function () {
    $gainedPoint.fadeOut(200, function () {
      $gainedPoint.removeClass("gainedPoint--" + _eval);
    });
  });
}

function addBullethole(_event, _firedTarget) {
  let x = _event.offsetX - 4;
  let y = _event.offsetY - 4;
  if (_firedTarget === "targetInner") {
    x += _event.target.offsetLeft * (1 - 27 / 87);
    y += _event.target.offsetTop * (1 - 27 / 87);
  }
  avgPosXOfShot += x;
  avgPosYOfShot += y;
  const bullethole = document.createElement("span");
  bullethole.className = "bullethole";
  bullethole.setAttribute("style", `top:${y}px;left:${x}px;`);
  showBulletholes.appendChild(bullethole);
}

function addAvgBullethole() {
  const avgBullethole = document.createElement("span");
  const x = avgPosXOfShot / scores[3];
  const y = avgPosYOfShot / scores[3];
  avgBullethole.className = "avgBullethole";
  avgBullethole.setAttribute("style", `top:${y}px;left:${x}px;`);
  showBulletholes.appendChild(avgBullethole);
}

let countDownIntervalId = 0;
function countDownTimer() {
  countDownIntervalId = setInterval(function () {
    timelimit = timelimit - 1;
    timer.innerHTML = timelimit;
    if (timelimit < 1) {
      clearInterval(countDownIntervalId);
      setDisplayValue("none", "block", "block");
      addAvgBullethole();
    }
  }, 1000);
}

function backToStartScene() {
  setDisplayValue("block", "none", "none");
}

function setDisplayValue(
  _startSceneDisplay,
  _playSceneDisplay,
  _resultSceneDisplay
) {
  document.querySelector(".startScene").style.display = _startSceneDisplay;
  playScene.style.display = _playSceneDisplay;
  resultScene.style.display = _resultSceneDisplay;
}

function playSE(_soundSrc) {
  if (document.querySelector(".enableSE").checked) {
    const SE = new Audio(_soundSrc);
    SE.play();
  }
}

function moveTarget() {
  const X = (
    Math.random() * (windowWidth * 0.8 - windowWidth * 0.15) +
    windowWidth * 0.15
  ).toFixed(0);
  const Y = (
    Math.random() * (windowHeight * 0.8 - windowHeight * 0.15) +
    windowHeight * 0.15
  ).toFixed(0);
  $target.stop();
  $target.animate({ top: Y, left: X }, 120);
}
