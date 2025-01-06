const fileInput = document.getElementById('fileInput');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const canvas = document.getElementById('analyzerCanvas');
const canvasCtx = canvas.getContext('2d');

let audioContext, sourceNode, analyser, audio, animationId;

// オーディオ再生のセットアップ
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (audio) audio.pause(); // 前の音声を停止
        audio = new Audio(URL.createObjectURL(file));
        setupAudioContext();
    }
});

// オーディオコンテキストの初期化
function setupAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!sourceNode) {
        sourceNode = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // 分析の解像度
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
    }
}

// 再生ボタン
playBtn.addEventListener('click', () => {
    if (audio) {
        audio.play();
        visualize();
    } else {
        alert('音楽ファイルを選択してください！');
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

// ビジュアライゼーション関数
function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray); // 周波数データを取得

        // キャンバスをクリア
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