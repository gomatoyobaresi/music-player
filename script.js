const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const volumeBar = document.getElementById('volumeBar');
const volumeIcon = document.getElementById('volumeIcon');
const backBtn = document.getElementById('backBtn');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const progressBar = document.getElementById('progressBar');

let audioContext, sourceNode, analyser, audio, animationId;
let isPlaying = false;

// ローカルストレージから音楽ファイルを取得
const audioFileURL = localStorage.getItem('audioFile');
const audioFileName = localStorage.getItem('audioFileName');

if (audioFileURL && audioFileName) {
    fileNameDisplay.textContent = `再生中: ${audioFileName}`;
    setupAudioContext(audioFileURL);
} else {
    alert('音楽ファイルが選択されていません');
}

// オーディオコンテキストとノードのセットアップ
function setupAudioContext(fileURL) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audio = new Audio(fileURL);
    sourceNode = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);

    audio.addEventListener('timeupdate', updateProgressBar);
}

// 再生ボタン
playBtn.addEventListener('click', () => {
    if (audio) {
        audio.play();
        isPlaying = true;
        playBtn.disabled = true;
        pauseBtn.disabled = false;
    }
});

// 一時停止ボタン
pauseBtn.addEventListener('click', () => {
    if (audio) {
        audio.pause();
        isPlaying = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
    }
});

// 停止ボタン
stopBtn.addEventListener('click', () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        clearCanvas();
    }
});

// 戻るボタン
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html'; // ファイル選択画面へ戻る
});

// 音量バー変更
volumeBar.addEventListener('input', () => {
    if (audio) {
        audio.volume = volumeBar.value;

        // 音量アイコンの変更
        if (audio.volume === 0) {
            volumeIcon.src = 'images/volume-mute.png';
        } else if (audio.volume < 0.3) {
            volumeIcon.src = 'images/volume-low.png';
        } else if (audio.volume < 0.7) {
            volumeIcon.src = 'images/volume-medium.png';
        } else {
            volumeIcon.src = 'images/volume-high.png';
        }
    }
});

// 再生位置の更新
progressBar.addEventListener('input', () => {
    if (audio) {
        audio.currentTime = (progressBar.value / 100) * audio.duration;
    }
});

// 再生中の進捗バーを更新
function updateProgressBar() {
    if (audio) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress || 0; // NaN対策
    }
}

// キャンバスをクリア
function clearCanvas() {
    const canvas = document.getElementById('analyzerCanvas');
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}
