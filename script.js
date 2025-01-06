const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const loopBtn = document.getElementById('loopBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeBar = document.getElementById('volumeBar');
const canvas = document.getElementById('analyzerCanvas');
const canvasCtx = canvas.getContext('2d');
const currentFileName = document.getElementById('currentFileName'); // ファイル名表示用要素

let audioContext, sourceNode, analyser, audio, animationId;
let isLooping = false;

// ローカルストレージから音楽ファイルを取得
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
    currentFileName.innerText = `再生中: ${fileURL.split('/').pop()}`; // 再生中のファイル名を表示
}

// 再生ボタン
playBtn.addEventListener('click', () => {
    if (audio) {
        audio.play();
        visualize();
    } else {
        alert('音楽ファイルを選択してください');
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
    if (isLooping) {
        audio.loop = true;
    } else {
        audio.loop = false;
    }
});

// 音量バー
volumeBar.addEventListener('input', () => {
    if (audio) {
        audio.volume = volumeBar.value / 100; // 音量を設定
        updateVolumeIcon();
    }
});

// 音量アイコンの更新
function updateVolumeIcon() {
    const volumeLevel = audio.volume;

    if (volumeLevel === 0) {
        volumeBtn.src = 'images/volume-muted.png'; // ミュートアイコン
    } else if (volumeLevel < 0.5) {
        volumeBtn.src = 'images/volume-low.png'; // 低音量アイコン
    } else if (volumeLevel < 1) {
        volumeBtn.src = 'images/volume-medium.png'; // 中音量アイコン
    } else {
        volumeBtn.src = 'images/volume-high.png'; // 高音量アイコン
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
