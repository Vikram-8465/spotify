import { LightningElement, api , track } from 'lwc';
import { getAudioInstance,setPlaylistSongs, getPlaylistSongs, setCurrentSongId, getSongById } from 'c/scriptUtils';
import SPOTIFY_SVGS from '@salesforce/resourceUrl/spotify_svgs';
const ALL_SVGS = {
    play: `${SPOTIFY_SVGS}/img/play.svg`,
    love: `${SPOTIFY_SVGS}/img/love.svg`,
}

export default class ListOfSongs extends LightningElement {
    @api playlistId;
    spotifySvgs = ALL_SVGS;
    playlistInfo;
    @track playlistSongs = [];
    audio = getAudioInstance();
    isPlaylistChanged = false;
    isSongPaused = false;
    isPlaylistSet = true;

    connectedCallback(){
        this.getPlaylistSongs(this.playlistId);
    }

    async getPlaylistSongs(playlistId){
       const data = await fetch(`https://saavn.dev/api/playlists?id=${playlistId}&limit=50`);
       const results = await data?.json();
       this.playlistInfo = {
           id: results?.data?.id,
           type: results?.data?.type,
           name: results?.data?.name,
           description: results?.data?.description,
           songsCount: results?.data?.songCount,
           imageUrl: results?.data?.image?.[2]?.url || results?.data?.image?.[1]?.url || results?.data?.image?.[0]?.url
       }

       this.playlistSongs = results?.data?.songs.map((song, index) => {
        return {
            id: song?.id,
            number: `${index + 1}`,
            imageUrl: song?.image?.[2]?.url || song?.image?.[1]?.url,
            title: song?.name?.replace(/[~!@#$%^&*()_+{}\[\]:";'<>?,./|\\].*?[~!@#$%^&*()_+{}\[\]:";'<>?,./|\\]/g, '').split(',')[0].trim() || 'unknown title',
            artist: song?.artists?.primary?.slice(0,2).map(artist => artist?.name).join(', ') || 'unknown artist',
            album: song?.album?.name?.replace(/[~!@#$%^&*()_+{}\[\]:";'<>?,./|\\].*?[~!@#$%^&*()_+{}\[\]:";'<>?,./|\\]/g, '').split(',')[0].trim() || 'unknown title',
            language: song?.language,
            duration: `${Math.floor(song?.duration / 60)} : ${song?.duration % 60 < 10 ? `0${song?.duration % 60}` : song?.duration % 60}`,
            songUrl1: song?.downloadUrl?.filter(url => url?.quality === '160kbps')[0]?.url,
            songUrl2: song?.downloadUrl?.filter(url => url?.quality === '320kbps')[0]?.url
        };
    });

    this.isPlaylistChanged = true;
    console.log(this.playlistSongs);

    }

    loveHandler(event) {
         event.target.closest('tr').querySelector('.album img').style.opacity = '0';    
    }

    playHandler(event){
        if(this.isPlaylistSet){
            setPlaylistSongs(this.playlistSongs);
            this.isPlaylistSet = false;
        }

        const songId = event.currentTarget.dataset.id;
        console.log(songId);
        this.playSong(songId);
    }

    @api 
    playSong(songId) {
        console.log('from list of songs:', this.playlistSongs);
        console.log('from list of songs:', JSON.stringify(this.playlistSongs));
        const song = getSongById(songId);
        const songUrl = song?.songUrl1;

        if (this.audio.src !== songUrl) {
            this.audio.src = songUrl;
            this.audio.play();
            this.customEventUtility({currentSongId: songId, isPlaying: true});

        } else if (!this.isSongPaused) {
            this.audio.pause();
            this.isSongPaused = true;
            this.customEventUtility({currentSongId: songId, isPlaying: false});

        } else {
            this.audio.play();
            this.isSongPaused = false;
            this.customEventUtility({currentSongId: songId, isPlaying: true});
        }

        setCurrentSongId(songId);
    }

    playSongsListHandler(event) {
        console.log('from list of songs:', event);
        if(this.isPlaylistSet){
            setPlaylistSongs(this.playlistSongs);
            this.isPlaylistSet = false;
        }
        const firstSong = getPlaylistSongs()[0];
        if (firstSong) {
            this.audio.src = firstSong.songUrl1;
            this.audio.play();
            this.customEventUtility({currentSongId: firstSong.id, isPlaying: true});
        }
    }

    customEventUtility({currentSongId, isPlaying}) {
        console.log('customutility', this.isPlaylistChanged, getPlaylistSongs());
        
        this.dispatchEvent(new CustomEvent('songchange', {
            detail: {
                currentSongId: currentSongId,
                isPlaying: isPlaying,
                playlistId: this.playlistId,
                playlistSongs: this.isPlaylistChanged ? getPlaylistSongs() : null
            }
        }));

        this.isPlaylistChanged = false;

    }
       
}