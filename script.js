const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const backBtn = document.getElementById('backBtn');
const volumeBar = document.getElementById('volumeBar');
const volumeIcon = document.getElementById('volumeIcon');
const fileNameDisplay = document.getElementById('fileName');
const canvas = document.getElementById('analyzerCanvas');
const canvasCtx = canvas.getContext('2d');

let audio = new Audio();
let audioContext, sourceNode, analyser, animationId;

// ファイル名を表示
const audioFileName = localStorage.getItem('audioFileName');
if (audioFileName) fileNameDisplay.textContent = `再生中: ${audioFileName}`;

// 音声ファイルをセットアップ
const audioFileURL = localStorage.getItem('audioFile');
if (audioFileURL) {
    audio.src = audioFileURL;
    audio.load();
    setupAudioContext();
}

// オーディオコンテキストの初期化
function setupAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
}

// 再生ボタン
playBtn.addEventListener('click', () => {
    audio.play();
    visualize();
});

// 一時停止ボタン
pauseBtn.addEventListener('click', () => {
    audio.pause();
});

// 停止ボタン
stopBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    cancelAnimationFrame(animationId);
    clearCanvas();
});

// 戻るボタン
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// 音量バー
volumeBar.value = 0.5; // 初期音量50%
audio.volume = volumeBar.value;

volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value;

    // 音量アイコンの変更
    if (audio.volume === 0) {
        volumeIcon.src = 'images/volume-mute.png';
    } else if (audio.volume < 0.3) {
        volumeIcon.src = 'images/volume-low.png';
    } else if (audio.volume < 0.7) {
        volumeIcon.src = 'images/volume-medium.png'; // mediumを追加
    } else {
        volumeIcon.src = 'images/volume-high.png';
    }
});


// スペクトラムのビジュアライゼーション
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / bufferLength;
        let barHeight, x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    };

    draw();
}

// キャンバスをクリア
function clearCanvas() {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}
