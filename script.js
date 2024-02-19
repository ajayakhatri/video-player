const playPauseBtn = document.querySelector(".play-pause-btn");
const theaterBtn = document.querySelector(".theater-btn");
const fullScreenBtn = document.querySelector(".full-screen-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const muteBtn = document.querySelector(".mute-btn");
const speedBtn = document.querySelector(".speed-btn");
const currentTimeElem = document.querySelector(".current-time");
const totalTimeElem = document.querySelector(".total-time");
const previewImg = document.querySelector(".preview-img");
const thumbnailImg = document.querySelector(".thumbnail-img");
const volumeSlider = document.querySelector(".volume-slider");
const videoContainer = document.querySelector(".video-container");
const timelineContainer = document.querySelector(".timeline-container");
const videoInput = document.querySelector("#video-input");
const video = document.querySelector("#video");
const controls = document.querySelector(".controls");
const playbackSymbol = document.querySelector(".playback-symbol");
const playbackSymbolContainer = document.querySelector(
  ".playback-symbol-container"
);

videoInput.addEventListener("submit", (e) => {
  e.preventDefault();
  const locationInput = document.getElementById("locationInput");
  const location = locationInput.value;
  let withoutQuotes = location.replace(/"/g, "");

  const match = withoutQuotes.match(/[^\\]*$/);
  const filename = match[0];

  if (filename) {
    document.title = filename + " - Video Player";
  } else {
    document.title = "Video Player";
  }
  video.src = withoutQuotes;
  previewImg.src = withoutQuotes;
});
let toshowcontrol = false;

function togglecontrol() {
  controls.style.display = toshowcontrol ? "flex" : "none";
  toshowcontrol = !toshowcontrol;
}

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();
  if (tagName === "input") return;
  switch (e.key.toLowerCase()) {
    case " ":
      if (tagName === "button") return;
    case "k":
      togglePlay();
      break;
    case "x":
      togglecontrol();
      break;
    case "arrowup":
      changevolume("up");
      break;
    case "arrowdown":
      changevolume("down");
      break;
    case ">":
      increasePlaybackSpeed();
      break;
    case "<":
      decreasePlaybackSpeed();
      break;
    case "f":
      toggleFullScreenMode();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "i":
      toggleMiniPlayerMode();
      break;
    case "m":
      toggleMute();
      break;
    case "arrowleft":
    case "j":
      skip(-5);
      break;
    case "arrowright":
    case "l":
      skip(5);
      break;
  }
});

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused;
function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;
  videoContainer.classList.toggle("scrubbing", isScrubbing);
  if (isScrubbing) {
    wasPaused = video.paused;
    video.pause();
  } else {
    video.currentTime = percent * video.duration;
    if (!wasPaused) video.play();
  }

  handleTimelineUpdate(e);
}

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;

  previewImg.currentTime = video.duration * percent;

  timelineContainer.style.setProperty("--preview-position", percent);
  if (isScrubbing) {
    e.preventDefault();
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}

// Playback Speed
speedBtn.addEventListener("click", changePlaybackSpeed);


function showLabel(toshow, top = "10%", left = "45%") {
  playbackSymbolContainer.style.setProperty("--top", top);
  playbackSymbolContainer.style.setProperty("--left", left);
  playbackSymbolContainer.style.display = "flex";
  playbackSymbol.textContent = toshow;
  setTimeout(() => {
    playbackSymbolContainer.style.display = "none";
  }, "500");
}

function increasePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 4) newPlaybackRate = 4;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
  showLabel(`${newPlaybackRate}x`)
}

function decreasePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate - 0.25;
  if (newPlaybackRate <= 0) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
  showLabel(`${newPlaybackRate}x`)
}

function changePlaybackSpeed() {
  let newPlaybackRate = video.playbackRate + 0.25;
  if (newPlaybackRate > 4) newPlaybackRate = 0.25;
  video.playbackRate = newPlaybackRate;
  speedBtn.textContent = `${newPlaybackRate}x`;
  showLabel(`${newPlaybackRate}x`)
}

// Duration
video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(video.duration);
});

video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(video.currentTime);
  const percent = video.currentTime / video.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
  minimumIntegerDigits: 2,
});
function formatDuration(time) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor(time / 60) % 60;
  const hours = Math.floor(time / 3600);
  if (hours === 0) {
    return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
  } else {
    return `${hours}:${leadingZeroFormatter.format(
      minutes
    )}:${leadingZeroFormatter.format(seconds)}`;
  }
}

function skip(duration) {
  if (duration < 0) {
    showLabel(`<< ${-1 * duration}sec`, "50%", "15%")
  } else {
    showLabel(`${duration}sec >>`, "50%", "75%")
  }
  video.currentTime += duration;
}

// Volume
muteBtn.addEventListener("click", toggleMute);

function changevolume(key) {
  let newVolume = video.volume
  if (key == "up") {
    newVolume += 0.05
  } else if (key == "down") {
    newVolume -= 0.05
  }
  if (newVolume > 1) {
    newVolume = 1;
  } else if (newVolume <= 0) {
    newVolume = 0;
  }

  video.volume = newVolume;
  showLabel(`${Math.round(newVolume * 100)}%`)
}
volumeSlider.addEventListener("input", (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === 0;
});

function toggleMute() {
  video.muted = !video.muted;
}

video.addEventListener("volumechange", () => {
  volumeSlider.value = video.volume;
  let volumeLevel;
  if (video.muted || video.volume === 0) {
    volumeSlider.value = 0;
    volumeLevel = "muted";
  } else if (video.volume >= 0.5) {
    volumeLevel = "high";
  } else {
    volumeLevel = "low";
  }

  videoContainer.dataset.volumeLevel = volumeLevel;
});

// View Modes
theaterBtn.addEventListener("click", toggleTheaterMode);
fullScreenBtn.addEventListener("click", toggleFullScreenMode);
miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode);

function toggleTheaterMode() {
  videoContainer.classList.toggle("theater");
}

function toggleFullScreenMode() {
  if (document.fullscreenElement == null) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function toggleMiniPlayerMode() {
  if (videoContainer.classList.contains("mini-player")) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

document.addEventListener("fullscreenchange", () => {
  videoContainer.classList.toggle("full-screen", document.fullscreenElement);
});

video.addEventListener("enterpictureinpicture", () => {
  videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
  videoContainer.classList.remove("mini-player");
});

// Play/Pause
playPauseBtn.addEventListener("click", togglePlay);
video.addEventListener("click", togglePlay);

function togglePlay() {
  previewImg.style.setProperty(
    "--video-aspect",
    video.videoWidth / video.videoHeight
  );
  video.paused ? video.play() : video.pause();
}

video.addEventListener("play", () => {
  videoContainer.classList.remove("paused");
});

video.addEventListener("pause", () => {
  videoContainer.classList.add("paused");
});
