document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const trackList = document.getElementById('track-list');
    const audioPlayer = document.getElementById('audio-player');
    const videoPlayer = document.getElementById('video-player');
    const playPauseBtn = document.getElementById('play-pause-btn'); // img要素になった
    const skipBackwardBtn = document.getElementById('skip-backward-btn');
    const skipForwardBtn = document.getElementById('skip-forward-btn');
    const loopBtn = document.getElementById('loop-btn');
    const equalizerCanvas = document.getElementById('equalizer-canvas');
    const canvasCtx = equalizerCanvas.getContext('2d');

    // 画像ファイルのパスを定義
    const PLAY_BUTTON_IMAGE = 'images/再生ボタン.png';
    const PAUSE_BUTTON_IMAGE = 'images/一時停止ボタン.png';

    let currentTrackIndex = -1;
    let playlist = [];
    let isLoopingPlaylist = false;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    let source;

    function ensureAudioContextResumed() {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(e => console.error("Failed to resume AudioContext:", e));
        }
    }

    function connectAudioToAnalyser(mediaElement) {
        ensureAudioContextResumed();

        if (source) {
            source.disconnect();
        }
        source = audioCtx.createMediaElementSource(mediaElement);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;
    }

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('highlight');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('highlight');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('highlight');

        const files = e.dataTransfer.files;

        if (files.length > 0) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('audio/') || file.type === 'video/mp4') {
                    addFileToPlaylist(file);
                } else {
                    alert(`サポートされていないファイル形式です: ${file.name}\nMP3またはMP4ファイルのみ対応しています。`);
                }
            });
        } else {
            alert('MP3またはMP4ファイルをドラッグ＆ドロップしてください。');
        }
    });

    function addFileToPlaylist(file) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('audio/') ? 'audio' : 'video';
        playlist.push({ name: file.name, url: url, type: type });
        renderPlaylist();
    }

    function renderPlaylist() {
        trackList.innerHTML = '';
        playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = track.name;
            li.dataset.index = index;
            if (index === currentTrackIndex) {
                li.classList.add('playing');
            }
            li.addEventListener('click', () => playTrack(index));
            trackList.appendChild(li);
        });
    }

    async function playTrack(index) {
        if (index < 0 || index >= playlist.length) return;

        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = '';
        audioPlayer.style.display = 'none';

        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoPlayer.src = '';
        videoPlayer.style.display = 'none';

        currentTrackIndex = index;
        const track = playlist[currentTrackIndex];

        let mediaToPlay = null;

        if (track.type === 'audio') {
            audioPlayer.src = track.url;
            audioPlayer.style.display = 'block';
            mediaToPlay = audioPlayer;
        } else if (track.type === 'video') {
            videoPlayer.src = track.url;
            videoPlayer.style.display = 'block';
            mediaToPlay = videoPlayer;
        }

        if (mediaToPlay) {
            try {
                ensureAudioContextResumed();
                await mediaToPlay.play();
                connectAudioToAnalyser(mediaToPlay);
            } catch (e) {
                console.error("Playback failed:", e);
                alert("メディアの再生が自動で開始できませんでした。再生ボタンを再度押してください。");
                mediaToPlay.pause();
            }
        }

        renderPlaylist();
        updatePlayPauseButton();
    }

    playPauseBtn.addEventListener('click', async () => {
        ensureAudioContextResumed();

        let currentMedia = null;
        if (audioPlayer.style.display === 'block' && audioPlayer.src) {
            currentMedia = audioPlayer;
        } else if (videoPlayer.style.display === 'block' && videoPlayer.src) {
            currentMedia = videoPlayer;
        } else {
            if (playlist.length > 0 && currentTrackIndex === -1) {
                await playTrack(0);
                return;
            } else if (playlist.length === 0) {
                alert("プレイリストにメディアがありません。ファイルをドラッグ＆ドロップしてください。");
                return;
            }
        }

        if (currentMedia) {
            if (currentMedia.paused) {
                try {
                    await currentMedia.play();
                } catch (e) {
                    console.error("Playback failed on play button:", e);
                    alert("メディアの再生に失敗しました。ファイルが破損しているか、ブラウザの設定をご確認ください。");
                }
            } else {
                currentMedia.pause();
            }
        }
        updatePlayPauseButton();
    });

    skipBackwardBtn.addEventListener('click', () => {
        let currentMedia = null;
        if (audioPlayer.style.display === 'block' && audioPlayer.src) {
            currentMedia = audioPlayer;
        } else if (videoPlayer.style.display === 'block' && videoPlayer.src) {
            currentMedia = videoPlayer;
        }

        if (currentMedia) {
            currentMedia.currentTime = Math.max(0, currentMedia.currentTime - 10);
        }
    });

    skipForwardBtn.addEventListener('click', () => {
        let currentMedia = null;
        if (audioPlayer.style.display === 'block' && audioPlayer.src) {
            currentMedia = audioPlayer;
        } else if (videoPlayer.style.display === 'block' && videoPlayer.src) {
            currentMedia = videoPlayer;
        }

        if (currentMedia) {
            currentMedia.currentTime = Math.min(currentMedia.duration || currentMedia.currentTime, currentMedia.currentTime + 10);
        }
    });

    loopBtn.addEventListener('click', () => {
        let currentMedia = null;
        if (audioPlayer.style.display === 'block' && audioPlayer.src) {
            currentMedia = audioPlayer;
        } else if (videoPlayer.style.display === 'block' && videoPlayer.src) {
            currentMedia = videoPlayer;
        }

        if (currentMedia) {
            currentMedia.loop = !currentMedia.loop;
            isLoopingPlaylist = false;
            alert(`単一曲ループ: ${currentMedia.loop ? 'ON' : 'OFF'}`);
        } else {
            isLoopingPlaylist = !isLoopingPlaylist;
            alert(`プレイリストループ: ${isLoopingPlaylist ? 'ON' : 'OFF'}`);
        }
    });

    // 再生/一時停止ボタンの画像更新
    function updatePlayPauseButton() {
        let isPlaying = false;
        if (audioPlayer.style.display === 'block' && !audioPlayer.paused) {
            isPlaying = true;
        } else if (videoPlayer.style.display === 'block' && !videoPlayer.paused) {
            isPlaying = true;
        }
        
        // 画像のsrcを切り替える
        playPauseBtn.src = isPlaying ? PAUSE_BUTTON_IMAGE : PLAY_BUTTON_IMAGE;
    }

    [audioPlayer, videoPlayer].forEach(mediaElement => {
        mediaElement.addEventListener('play', updatePlayPauseButton);
        mediaElement.addEventListener('pause', updatePlayPauseButton);
        mediaElement.addEventListener('ended', updatePlayPauseButton);
    });

    [audioPlayer, videoPlayer].forEach(mediaElement => {
        mediaElement.addEventListener('ended', () => {
            if (mediaElement.loop) {
                return;
            }
            if (isLoopingPlaylist) {
                const nextIndex = (currentTrackIndex + 1) % playlist.length;
                playTrack(nextIndex);
            } else {
                if (currentTrackIndex + 1 < playlist.length) {
                    playTrack(currentTrackIndex + 1);
                } else {
                    currentTrackIndex = -1;
                    renderPlaylist();
                    audioPlayer.pause();
                    audioPlayer.currentTime = 0;
                    audioPlayer.src = '';
                    audioPlayer.style.display = 'none';

                    videoPlayer.pause();
                    videoPlayer.currentTime = 0;
                    videoPlayer.src = '';
                    videoPlayer.style.display = 'none';
                }
            }
        });
    });

    function drawEqualizer() {
        requestAnimationFrame(drawEqualizer);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, equalizerCanvas.width, equalizerCanvas.height);

        const barWidth = (equalizerCanvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i];
            const normalizedHeight = barHeight / 255;
            const displayHeight = normalizedHeight * equalizerCanvas.height * 0.9;

            canvasCtx.fillStyle = '#00f'; // 青色に固定

            canvasCtx.fillRect(x, equalizerCanvas.height - displayHeight, barWidth, displayHeight);

            x += barWidth + 1;
        }
    }
    drawEqualizer();
});
