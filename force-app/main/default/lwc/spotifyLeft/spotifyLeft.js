import { LightningElement } from 'lwc';
import SPOTIFY_SVGS from '@salesforce/resourceUrl/spotify_svgs';

export default class SpotifyLeft extends LightningElement {

    spotifySvgs = {
        logo: `${SPOTIFY_SVGS}/img/logo.svg`,
        home: `${SPOTIFY_SVGS}/img/home.svg`,
        search: `${SPOTIFY_SVGS}/img/search.svg`,
        playlist: `${SPOTIFY_SVGS}/img/playlist.svg`,
        plus: `${SPOTIFY_SVGS}/img/plus.svg`,
        music: `${SPOTIFY_SVGS}/img/music.svg`,
        play: `${SPOTIFY_SVGS}/img/play.svg`,
    };

    connectedCallback() {   
        
    }
}