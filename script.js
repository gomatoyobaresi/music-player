const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const loopBtn = document.getElementById('loopBtn');
const volumeBar = document.getElementById('volumeBar');
const volumeIcon = document.getElementById('volumeIcon');
const backToSelection = document.getElementById('backToSelection');
const fileNameDisplay = document.getElementById('fileNameDisplay');

const canvas = document.getElementById('analyzerCanvas');
const canvasCtx = canvas.getContext('2d');

let audioContext, sourceNode, analyser, audio, animationId;
let isLooping = false;

// ローカルストレージから音楽ファイルを取得
const audioFileURL = localStorage.getItem('audioFile');
const audioFileName = localStorage.getItem('audioFileName'); // ファイル名
if (audioFileURL) {
    setupAudioContext(audioFileURL);
    fileNameDisplay.textContent = `再生中: ${audioFileName}`;
} else {
    fileNameDisplay.textContent = '再生中のファイルはありません';
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

// 音量変更時のイベント
volumeBar.addEventListener('input', (event) => {
    if (audio) {
        audio.volume = event.target.value;
        updateVolumeIcon(audio.volume);
    }
});

// 音量に応じてアイコンを変更
function updateVolumeIcon(volume) {
    if (volume === 0) {
        volumeIcon.src = 'images/volume-mute.PNG';
    } else if (volume < 0.3) {
        volumeIcon.src = 'images/volume-low.PNG';
    } else if (volume < 0.7) {
        volumeIcon.src = 'images/volume-medium.PNG';
    } else {
        volumeIcon.src = 'images/volume-high.PNG';
    }
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

// ファイル選択画面に戻る
backToSelection.addEventListener('click', () => {
    window.location.href = 'index.html';
});
