const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const playlist = document.getElementById('playlist');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const fileNameDisplay = document.getElementById('fileNameDisplay');
let audio = new Audio();
let currentTrack = 0;
let trackList = [];

// ファイル選択イベント
fileInput.addEventListener('change', function(event) {
    const files = event.target.files;

    // ファイルリストに追加
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const listItem = document.createElement('li');
        listItem.textContent = file.name;

        // 再生リストへの追加
        listItem.addEventListener('click', function() {
            addToPlaylist(file);
        });

        fileList.appendChild(listItem);
    }
});

// 再生リストに曲を追加
function addToPlaylist(file) {
    if (playlist.children.length < 8) {
        const listItem = document.createElement('li');
        listItem.draggable = true;

        // ドラッグ用画像を追加
        const dragHandle = document.createElement('img');
        dragHandle.classList.add('drag-handle');
        dragHandle.src = 'drag-icon.png';
        dragHandle.alt = 'ドラッグハンドル';

        const textSpan = document.createElement('span');
        textSpan.textContent = file.name;

        // 削除ボタンを追加
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.style.marginLeft = '10px';
        removeBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            playlist.removeChild(listItem);
            trackList = trackList.filter((track) => track !== file);
        });

        listItem.appendChild(dragHandle);
        listItem.appendChild(textSpan);
        listItem.appendChild(removeBtn);

        playlist.appendChild(listItem);
        trackList.push(file);

        // 曲を再生
        listItem.addEventListener('click', function() {
            playTrack(file);
        });

        // ドラッグ＆ドロップによる順番変更
        listItem.addEventListener('dragstart', function(event) {
            listItem.classList.add('dragging');
        });

        listItem.addEventListener('dragend', function(event) {
            listItem.classList.remove('dragging');
            updateTrackOrder();
        });

        playlist.addEventListener('dragover', function(event) {
            event.preventDefault();
            const draggingElement = playlist.querySelector('.dragging');
            const afterElement = getDragAfterElement(playlist, event.clientY);
            if (afterElement == null) {
                playlist.appendChild(draggingElement);
            } else {
                playlist.insertBefore(draggingElement, afterElement);
            }
        });
    } else {
        alert('最大8曲まで追加できます');
    }
}

// ドラッグ位置を取得
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// トラックの順番を更新
function updateTrackOrder() {
    const items = playlist.querySelectorAll('li');
    trackList = Array.from(items).map((item) => {
        const fileName = item.querySelector('span:nth-child(2)').textContent;
        return trackList.find((track) => track.name === fileName);
    });
}

// 曲を再生する
function playTrack(file) {
    audio.src = URL.createObjectURL(file);
    audio.play();
    fileNameDisplay.textContent = `再生中: ${file.name}`;
    playBtn.textContent = '再生中';
    pauseBtn.disabled = false;
    updateProgress();
}

// 再生中の進捗を更新
function updateProgress() {
    audio.addEventListener('timeupdate', function() {
        const currentTime = audio.currentTime;
        const duration = audio.duration;

        // プログレスバーの更新
        if (duration > 0) {
            progressBar.value = (currentTime / duration) * 100;
        }

        // 時間表示
        currentTimeDisplay.textContent = formatTime(currentTime);
        durationDisplay.textContent = formatTime(duration);
    });
}

// 時間のフォーマット関数
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 再生ボタン
playBtn.addEventListener('click', function() {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = '再生中';
        pauseBtn.disabled = false;
    }
});

// 一時停止ボタン
pauseBtn.addEventListener('click', function() {
    audio.pause();
    playBtn.textContent = '再生';
    pauseBtn.disabled = true;
});

// 停止ボタン
stopBtn.addEventListener('click', function() {
    audio.pause();
    audio.currentTime = 0;
    playBtn.textContent = '再生';
    pauseBtn.disabled = true;
});
