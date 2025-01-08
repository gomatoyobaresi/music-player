const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const volumeBar = document.getElementById('volumeBar');
const volumeIcon = document.getElementById('volumeIcon');
const backBtn = document.getElementById('backBtn');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const progressBar = document.getElementById('progressBar');
const fileList = document.getElementById('fileList'); // ファイルリストの要素
const playList = document.getElementById('playList'); // 再生リストの要素

let audioContext, sourceNode, analyser, audio;
let isPlaying = false;
let audioFiles = JSON.parse(localStorage.getItem('audioFiles')) || []; // ローカルストレージから音楽ファイルリストを取得
let currentTrackIndex = 0; // 再生中のトラックインデックス

// ファイルリストと再生リストを更新
function updateFileList() {
    fileList.innerHTML = ''; // ファイルリストをリセット
    audioFiles.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;

        const addToPlayListBtn = document.createElement('button');
        addToPlayListBtn.textContent = '再生リストに追加';
        addToPlayListBtn.addEventListener('click', () => addToPlayList(index));

        listItem.appendChild(addToPlayListBtn);
        fileList.appendChild(listItem);
    });
}

// 再生リストに追加
function addToPlayList(index) {
    const track = audioFiles[index];
    const listItem = document.createElement('li');
    listItem.textContent = track.name;

    const removeFromPlayListBtn = document.createElement('button');
    removeFromPlayListBtn.textContent = '削除';
    removeFromPlayListBtn.addEventListener('click', () => removeFromPlayList(listItem, track));

    listItem.appendChild(removeFromPlayListBtn);
    playList.appendChild(listItem);
}

// 再生リストから削除
function removeFromPlayList(listItem, track) {
    playList.removeChild(listItem);
    audioFiles = audioFiles.filter((file) => file !== track);
    localStorage.setItem('audioFiles', JSON.stringify(audioFiles));
}

// ローカルストレージから音楽ファイルを取得
if (audioFiles.length > 0) {
    updateFileList(); // 音楽ファイルリストを表示
    fileNameDisplay.textContent = `再生中: ${audioFiles[currentTrackIndex].name}`;
    setupAudioContext(audioFiles[currentTrackIndex]);
} else {
    alert('音楽ファイルが選択されていません');
}

// オーディオコンテキストとノードのセットアップ
function setupAudioContext(track) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audio = new Audio(URL.createObjectURL(track)); // ここを確認
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
        progressBar.value = 0; // 再生バーをリセット
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
            volumeIcon.src = 'images/volume-mute.PNG';
        } else if (audio.volume < 0.3) {
            volumeIcon.src = 'images/volume-low.PNG';
        } else if (audio.volume < 0.7) {
            volumeIcon.src = 'images/volume-medium.PNG';
        } else {
            volumeIcon.src = 'images/volume-high.PNG';
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
    if (audio && audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress || 0; // NaN対策
    }

    if (audio.ended) {
        // 再生した曲をリストから削除
        playList.removeChild(playList.children[0]);
        audioFiles = audioFiles.filter((file, index) => index !== currentTrackIndex); // 曲の削除
        localStorage.setItem('audioFiles', JSON.stringify(audioFiles));

        // 次の曲を再生
        if (audioFiles.length > 0 && currentTrackIndex < audioFiles.length) {
            currentTrackIndex++;
            audio = new Audio(URL.createObjectURL(audioFiles[currentTrackIndex]));
            setupAudioContext(audioFiles[currentTrackIndex]);
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            audio.play();
        } else {
            alert('再生リストが終了しました');
        }
    }
}
