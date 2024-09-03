// utils/audioService.js
let audioInstance = null;

export function getAudio() {
    if (!audioInstance) {
        audioInstance = new Audio();
    }
    return audioInstance;
}

// playlistUtils.js
let playlistSongs = [];
let currentSongId = null;

export function setPlaylistSongs(songs) {
    playlistSongs = songs;
}

export function getPlaylistSongs() {
    return playlistSongs;
}

export function setCurrentSongId(songId) {
    currentSongId = songId;
}

export function getCurrentSongId() {
    return currentSongId;
}

export function getNextSongId() {
    const currentSongIndex = playlistSongs.findIndex(song => song.id === currentSongId);
    if (currentSongIndex < playlistSongs.length - 1) {
        return playlistSongs[currentSongIndex + 1].id;
    }
    return null;
}

export function getPrevSongId() {
    const currentSongIndex = playlistSongs.findIndex(song => song.id === currentSongId);
    if (currentSongIndex > 0) {
        return playlistSongs[currentSongIndex - 1].id;
    }
    return null;
}

export function getSongById(songId) {
    return playlistSongs.find(song => song.id === songId);
}
