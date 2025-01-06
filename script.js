const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const loopBtn = document.getElementById('loopBtn');
const backBtn = document.getElementById('backBtn');
const volumeBar = document.getElementById('volumeBar');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const volumeIcon = document.getElementById('volumeIcon');
const canvas = document.getElementById('analyzerCanvas');
const canvasCtx = canvas.getContext('2d');

let audioContext, sourceNode, analyser, audio, animationId;
let isLooping = false;
let audioFileURL = localStorage.getItem('audioFile');

// ローカルストレージから音楽ファイルを取得
if (audioFileURL) {
    setupAudioContext(audioFileURL);
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
}

// 再生ボタン
playBtn.addEventListener('click', () => {
    if (audio) {
        audio.play();
        visualize();
    } else {
        alert('音楽ファイルが読み込まれていません');
    }
});

// 一時停止ボタン
pauseBtn.addEventListener('click', () => {
    if (audio) audio.pause();
});

// 停止ボタン
stopBtn.addEventListener('click', () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    cancelAnimationFrame(animationId);
    clearCanvas();
});

// ループ再生ボタン
loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    audio.loop = isLooping;
});

// 音量バーの更新
volumeBar.addEventListener('input', () => {
    const volume = volumeBar.value / 100;
    if (audio) {
        audio.volume = volume;
        updateVolumeIcon();
    }
});

// 音量アイコンの更新
function updateVolumeIcon() {
    const volumeLevel = audio.volume;

    if (volumeLevel === 0) {
        volumeIcon.src = 'images/volume-muted.PNG'; // ミュートアイコン
    } else if (volumeLevel < 0.5) {
        volumeIcon.src = 'images/volume-low.PNG'; // 低音量アイコン
    } else if (volumeLevel < 1) {
        volumeIcon.src = 'images/volume-medium.PNG'; // 中音量アイコン
    } else {
        volumeIcon.src = 'images/volume-high.PNG'; // 高音量アイコン
    }
}

// プログレスバーの更新
audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const duration = audio.duration;
    currentTimeDisplay.textContent = formatTime(currentTime);
    durationDisplay.textContent = formatTime(duration);
    progressBar.value = (currentTime / duration) * 100;
});

// プログレスバーをクリックしたとき
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// 時間のフォーマット
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// ビジュアライゼーション
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

// 戻るボタン
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html'; // ファイル選択画面に戻る
});
