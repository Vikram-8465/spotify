import { LightningElement, track } from 'lwc';
import { setPlaylistSongs, getPlaylistSongs, setCurrentSongId, getCurrentSongId, getNextSongId, getPrevSongId, getSongById } from 'c/scriptUtils';
import { getAudio } from 'c/scriptUtils';
import SPOTIFY_SVGS from '@salesforce/resourceUrl/spotify_svgs';

const ALL_SVGS = {
    left: `${SPOTIFY_SVGS}/img/left.svg`,
    right: `${SPOTIFY_SVGS}/img/right.svg`,
    play: `${SPOTIFY_SVGS}/img/play.svg`,
    pause: `${SPOTIFY_SVGS}/img/pause.svg`,
    nextsong: `${SPOTIFY_SVGS}/img/nextsong.svg`,
    prevsong: `${SPOTIFY_SVGS}/img/prevsong.svg`,
    mute: `${SPOTIFY_SVGS}/img/mute.svg`,
    unmute: `${SPOTIFY_SVGS}/img/unmute.svg`,
};

export default class SpotifyRight extends LightningElement {
     spotifySvgs = ALL_SVGS;
     playlistId;
     _songsData = [];
     audio ;
     isListOfSongsOpen = false;
     isPlaying = true;
     hasCurrentSong = false;
     isDisplayNone = true;
     songTime = '00:00/ 00:00';
     _intervalId;
     @track song = {};

    get songsData() {
        return this._songsData;
    }

    set songsData(value) {
        this._songsData = value;
    }

    constructor() {
        super();
        this.audio = getAudio();
    }


    connectedCallback() {
        this.getPlaylists();
    }

    async getPlaylists(type = 'trending') {
        console.log('type ', type);
        try {
            const response = await fetch(`https://saavn.dev/api/search/playlists?query=${type}&limit=25`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const results = await response.json();
    
            console.log('results ', results);
        
            if (results?.data?.total !== 0) {
                this._songsData = results.data.results.map(result => {
                    return {
                        id: result?.id,
                        name: result?.name,
                        type: result?.type,
                        count: result?.songCount,
                        language: result?.language,
                        imageUrl: result.image[2]?.url || result.image[1]?.url || result.image[0]?.url
                    }
                }).sort(() => Math.random() - 0.5);
               this.template.querySelector('.playlist-search').value = '';
    
            } else {
               this.template.querySelector('.playlist-search').value = '';
               this.showSnackbar('No results found');
            }
        } catch (error) {
            this.template.querySelector('.playlist-search').value = '';
            console.error('Fetch error:', error);
            this.showSnackbar('An error occurred while fetching playlists');
        }
    }
    
    showSnackbar(message) {
        const snackbar = this.template.querySelector('.snackbar');
        snackbar.textContent = message;
        snackbar.className = "snackbar show";
        setTimeout(() => {
            snackbar.className = snackbar.className.replace("show", "");
        }, 3000);
    }
    

    clickHandler(event) {
            const buttons = this.template.querySelectorAll('.buttons button');
        
            buttons.forEach((button, index) => {
                if (index !== buttons.length - 1) {
                    button.classList.remove('after-active');
                }
            });
        
            if (event.target !== buttons[buttons.length - 1]) {
                event.target.classList.add('after-active');
        
                const buttonText = event.target.textContent.toLowerCase();
                this.getPlaylists(buttonText);
            }
    }

    searchHandler(){
        let playlist = this.template.querySelector('.playlist-search').value;
        console.log(playlist);
        if(playlist){
            this.getPlaylists(playlist);
        }
    }

    playHandler(event) {
        this.isListOfSongsOpen = true; 
        this.playlistId = event.currentTarget.dataset.id;
        this.template.querySelector('.header .nav .leftImage').style.cursor = 'pointer';
        this.template.querySelector('.header .nav .rightImage').style.cursor = 'pointer';
    }

    songHandler(event) {
        const name = event.target.name;

        if (!getCurrentSongId() || !getPlaylistSongs() || getPlaylistSongs().length === 0) {
            console.error('Current song or playlist songs are not properly set');
            return;
        }

        if (name === 'prev') {
            const prevSongId = getPrevSongId();
            if (prevSongId) {
                setCurrentSongId(prevSongId);
                if( this.template.querySelector('c-list-of-songs')){
                    this.template.querySelector('c-list-of-songs').playSong(prevSongId);
                }else{
                  this.audio.src = getSongById(prevSongId).songUrl1;
                  this.audio.play();  
                  this.hasCurrentSong = !!getCurrentSongId();
                  if(getCurrentSongId()){
                    this.song = getSongById(getCurrentSongId());
                    console.log('song - ',JSON.stringify(this.song)); 
                    this.getSongTime(getCurrentSongId());
                 }
                }
            }
            else{
                this.showSnackbar('Previous song not available');
            }

        } else if (name === 'next') {
            const nextSongId = getNextSongId();
            if (nextSongId) {
                setCurrentSongId(nextSongId);
                if( this.template.querySelector('c-list-of-songs')){
                    this.template.querySelector('c-list-of-songs').playSong(nextSongId);
                }else{
                  this.audio.src = getSongById(nextSongId).songUrl1;
                  this.audio.play(); 
                  this.hasCurrentSong = !!getCurrentSongId();
                  if(getCurrentSongId()){
                    this.song = getSongById(getCurrentSongId());
                    console.log('song - ',JSON.stringify(this.song)); 
                    this.getSongTime(getCurrentSongId())
                } 
                }
            }
            else{
                this.showSnackbar('Next song is not available');
            }

        } else if (name === 'pause') {
            this.isPlaying = false;
            if( this.template.querySelector('c-list-of-songs')){
                this.template.querySelector('c-list-of-songs').playSong(getCurrentSongId());
            }else{
              this.audio.pause();  
            }

        } else if (name === 'play') {
            this.isPlaying = true;
            if( this.template.querySelector('c-list-of-songs')){
                this.template.querySelector('c-list-of-songs').playSong(getCurrentSongId());
            }else{
              this.audio.play();  
            }

        } else {
            console.warn('No action for the given button name:', name);
        }

        console.log('Updated current song ID:', getCurrentSongId());
    }



    songChangeHandler(event) {
        
        setCurrentSongId(event.detail?.currentSongId);
        if (event.detail.isPlaying) {
            this.isPlaying = event.detail?.isPlaying;
        }
        if (event.detail.playlistSongs) {
            setPlaylistSongs(event.detail?.playlistSongs);
        }
        if (event.detail.playlistId) {
            this.playlistId = event.detail?.playlistId;
        }
        this.hasCurrentSong = !!getCurrentSongId();
        if(getCurrentSongId()){
            this.song = getSongById(getCurrentSongId());
            console.log('song - ',JSON.stringify(this.song)); 
            this.getSongTime(getCurrentSongId());
        }
    }


    leftHandler() {
        this.isListOfSongsOpen = false;
    }

    rightHandler() {
        if(!!getCurrentSongId()){
            this.isListOfSongsOpen = true;
        }
    }

    muteHandler() {
        if (this.audio.src) {
            this.audio.muted = !this.audio.muted;
    
            // Toggle visibility of images based on the audio's muted state
            const unmuteImg = this.template.querySelector('.audio-control img[data-first]');
            const muteImg = this.template.querySelector('.audio-control img[data-two]');
    
            if (unmuteImg && muteImg) {
                if (this.audio.muted) {
                    // Show mute image and hide unmute image
                    unmuteImg.style.display = 'none';
                    muteImg.style.display = 'block';
                } else {
                    // Show unmute image and hide mute image
                    unmuteImg.style.display = 'block';
                    muteImg.style.display = 'none';
                }
            }
        }
    }
    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    
    getSongTime() {
        if (this.audio.src) {
            // Clear any existing interval to avoid multiple intervals running
            if (this._intervalId) {
                clearInterval(this._intervalId);
            }
    
            // Set up a new interval to update the song time every second
            this._intervalId = setInterval(() => {
                // Ensure currentTime and duration are valid numbers
                const currentTime = !isNaN(this.audio.currentTime)
                    ? `${String(Math.floor(this.audio.currentTime / 60)).padStart(2, '0')}:${String(Math.floor(this.audio.currentTime % 60)).padStart(2, '0')}`
                    : '00:00';
    
                const duration = !isNaN(this.audio.duration)
                    ? `${String(Math.floor(this.audio.duration / 60)).padStart(2, '0')}:${String(Math.floor(this.audio.duration % 60)).padStart(2, '0')}`
                    : '00:00';
    
                this.songTime = `${currentTime} / ${duration}`;
                this.template.querySelector('.circle').style.left = !isNaN(this.audio.duration) && this.audio.duration > 0
                    ? `${(this.audio.currentTime / this.audio.duration) * 100}%`
                    : '0%';
    
                if (this.audio.ended) {
                    const nextSongId = getNextSongId();
                    if (nextSongId) {
                        setCurrentSongId(nextSongId);
                        this.audio.src = getSongById(nextSongId).songUrl1;
                        this.audio.play();
                        this.song = getSongById(getCurrentSongId()); // Update the song details here
                        this.getSongTime(); // Call the method again to keep the interval running
    
                        // Trigger UI updates
                        this.hasCurrentSong = !!getCurrentSongId();
                        this.isPlaying = true;
                        console.log('song - ', JSON.stringify(this.song));
                    } else {
                        // Stop the interval if no next song is available
                        clearInterval(this._intervalId);
                    }
                }
            }, 1000);
        }
    }
    

    seekbarHandler(event){
        if(this.audio.src){
            this.template.querySelector('.circle').style.left = `${(event.offsetX / event.target.getBoundingClientRect().width) * 100}%`;
            this.audio.currentTime = (event.offsetX / event.target.getBoundingClientRect().width) * this.audio.duration;
            this.getSongTime();
        }
    }
}
