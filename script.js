document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  const blowButton = document.getElementById("blowButton");
  let candles = [];
  let audioContext, analyser, microphone;
  let audio = new Audio('hbd.mp3');

  function updateCandleCount() {
    const active = candles.filter(c => !c.classList.contains("out")).length;
    candleCountDisplay.textContent = active;
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    return avg > 50;
  }

  function blowOutCandles() {
    if (candles.length === 0) return;

    let blown = 0;
    if (isBlowing()) {
      candles.forEach(candle => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blown++;
        }
      });
    }

    if (blown > 0) updateCandleCount();

    if (candles.every(c => c.classList.contains("out"))) {
      setTimeout(() => {
        triggerConfetti();
        endlessConfetti();
        audio.play();
      }, 300);
    }
  }

  // 🎤 Mic access
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Mic access denied: " + err);
      });
  } else {
    console.log("getUserMedia not supported!");
  }

  // 🟡 Fallback blow button
  if (blowButton) {
    blowButton.addEventListener("click", () => {
      candles.forEach(c => {
        if (!c.classList.contains("out")) {
          c.classList.add("out");
        }
      });
      updateCandleCount();
      triggerConfetti();
      endlessConfetti();
      audio.play();
    });
  }
});

// 🎉 Confetti launcher
function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function endlessConfetti() {
  setInterval(() => {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0 }
    });
  }, 1000);
}
