const fileInput = document.getElementById('fileInput');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const loopBtn = document.getElementById('loopBtn');
const canvas = document.getElementById('analyzerCanvas');
const canvasCtx = canvas.getContext('2d');

let audioContext, sourceNode, analyser, audio, animationId;
let isLooping = false;

// 音楽ファイル選択後、再生画面に遷移
document.getElementById('nextBtn').addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        localStorage.setItem('audioFile', fileURL); // 音楽ファイルのURLを保存
        window.location.href = 'playback.html'; // 再生画面に遷移
    } else {
        alert('音楽ファイルを選択してください');
    }
});

// 音楽再生画面で音楽ファイルを取得
const audioFileURL = localStorage.getItem('audioFile');
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
    cancelAnimationFrame(animationId); // アニメーション停止
    clearCanvas();
});

// ループ再生ボタン
loopBtn.addEventListener('click', () => {
    isLooping = !isLooping;
    audio.loop = isLooping;
});

// ビジュアライゼーション
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray); // 周波数データを取得

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
