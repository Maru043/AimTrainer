"use strict";
{
  const $target = $(".target");
  const target = document.querySelector(".target");
  const timer = document.querySelector(".timer");
  const playScene = document.querySelector(".playScene");
  const resultScene = document.querySelector(".resultScene");
  const showBulletholes = document.querySelector(".showBulletholes");
  const submitBtn = document.querySelector(".submitBtn");
  let avgPosXOfShot = 0;
  let avgPosYOfShot = 0;
  let timelimit = 30;
  const windowWidth = 800,
    windowHeight = 800;
  const scores = { totalshots: 0, hits: 0, score: 0 };
  const addScore = {
    good: function () {
      scores.totalshots += 1;
      scores.hits += 1;
      scores.score += 1;
      updateScores();
    },
    miss: function () {
      scores.totalshots += 1;
      scores.score -= 1;
      updateScores();
    },
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
    .querySelector(".toTraining")
    .setAttribute("href", `http://${location.host}/training/`);

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

  target.addEventListener("mousedown", function (_event) {
    if (_event.button !== 0) return false;
    moveTarget();
    addScore.good();
    playSE("./sound/target.mp3");
    addBullethole(_event);
  });

  document
    .querySelector(".playSceneBackground")
    .addEventListener("mousedown", function (_event) {
      if (_event.button !== 0) return false;
      addScore.miss();
      playSE("./sound/missShoot.mp3");
    });

  const toggleAvgBullethole = document.querySelector(".toggleAvgBullethole");
  toggleAvgBullethole.addEventListener("click", function () {
    if (toggleAvgBullethole.checked) {
      document.querySelector(".avgBullethole").style.display = "block";
    } else {
      document.querySelector(".avgBullethole").style.display = "none";
    }
  });

  function initialize() {
    avgPosXOfShot = 0;
    avgPosYOfShot = 0;
    clearInterval(countDownIntervalId);
    timelimit = 30;
    timer.innerHTML = timelimit;
    target.setAttribute("style", `top:50%;left:50%;`);
    $target.off("mousedown");
    $target.one("mousedown", function () {
      countDownTimer();
    });
    submitBtn.addEventListener("click", putData, { once: true });
    document
      .querySelector(".getRankingBtn")
      .addEventListener("click", getRanking, { once: true });
    while (document.querySelector(".bullethole") !== null) {
      document.querySelector(".bullethole").remove();
    }
    while (document.querySelector(".record") !== null) {
      document.querySelector(".record").remove();
    }
    if (document.querySelector(".avgBullethole") !== null) {
      document.querySelector(".avgBullethole").remove();
    }
    for (let key in scores) {
      scores[key] = 0;
    }
    updateScores();
  }

  function updateScores() {
    const totalShots = document.querySelectorAll(".totalShots");
    const hits = document.querySelectorAll(".hits");
    const score = document.querySelectorAll(".score");
    const accuracy = document.querySelectorAll(".accuracy");
    for (let i = 0; i < totalShots.length; i++) {
      totalShots[i].innerHTML = scores.totalshots;
      score[i].innerHTML = scores.score;
      accuracy[i].innerHTML = ((scores.hits / scores.totalshots) * 100).toFixed(
        2
      );
    }
    for (let i = 0; i < hits.length; i++) {
      hits[i].innerHTML = scores.hits;
    }
  }

  function addBullethole(_event) {
    let x = _event.offsetX - 4;
    let y = _event.offsetY - 4;
    avgPosXOfShot += x;
    avgPosYOfShot += y;
    const bullethole = document.createElement("span");
    bullethole.className = "bullethole";
    bullethole.setAttribute("style", `top:${y}px;left:${x}px;`);
    showBulletholes.appendChild(bullethole);
  }

  function addAvgBullethole() {
    const avgBullethole = document.createElement("span");
    const x = avgPosXOfShot / scores.hits;
    const y = avgPosYOfShot / scores.hits;
    avgBullethole.className = "avgBullethole";
    avgBullethole.setAttribute("style", `top:${y}px;left:${x}px;`);
    showBulletholes.appendChild(avgBullethole);
  }

  let countDownIntervalId = 0;
  function countDownTimer() {
    countDownIntervalId = setInterval(function () {
      timelimit--;
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

  function putData() {
    const record = {};
    record.name = document.querySelector(".userName").value;
    record.score = scores.score;
    record.accuracy = ((scores.hits / scores.totalshots) * 100).toFixed(2);
    fetch(`http://${location.host}/challenge/submit/`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      redirect: "follow",
      referrer: "no-refferrer",
      body: JSON.stringify(record),
    });
  }

  function getRanking() {
    let records;

    fetch(`http://${location.host}/challenge/getRanking/`)
      .then(function (response) {
        return response.json();
      })
      .then(function (records) {
        console.log(records);
        for (let i = 0; i < records.Records.length; i++) {
          const record = records.Records[i];
          const ul = document.createElement("ul");
          ul.setAttribute("class", "record");
          for (let key in record) {
            const li = document.createElement("li");
            const text = document.createTextNode(record[key]);
            li.appendChild(text);
            ul.appendChild(li);
          }
          document.querySelector(".leaderBoard").appendChild(ul);
        }
      });
  }
}
