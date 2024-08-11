global with sharing class PlaylistController {
    @AuraEnabled(cacheable=true)
    global static List<PlaylistWrapper2> getPlaylistsWithFiles() {
        List<PlaylistWrapper2> playlistsWithFiles = new List<PlaylistWrapper2>();

        for (Playlist__c playlist :  [ SELECT Id, Name, Description__c, 
                                  (SELECT Id, ContentDocument.FileType, ContentDocument.LatestPublishedVersionId FROM ContentDocumentLinks WHERE ContentDocument.FileType ='JPG') 
                                        FROM Playlist__c ]) {
            PlaylistWrapper2 pw = new PlaylistWrapper2();
            pw.Id = playlist.Id;
            pw.Name = playlist.Name;
            pw.Description = playlist.Description__c;

       if (!playlist.ContentDocumentLinks.isEmpty()) {
                String baseURL = URL.getOrgDomainUrl().toExternalForm(); 
                String versionId = playlist.ContentDocumentLinks[0].ContentDocument.LatestPublishedVersionId;
                pw.FileURL = baseURL + '/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb720by480&versionId=' + versionId;
            }

            playlistsWithFiles.add(pw);
        }

        return playlistsWithFiles;
    }
    
    global class PlaylistWrapper2 {
        @AuraEnabled public Id Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Description;
        @AuraEnabled public String FileURL;
    }


    @AuraEnabled(cacheable=true)
    public static List<PlaylistWrapper> getPlaylistsWithSongs() {
        List<PlaylistWrapper> playlistsWithSongs = new List<PlaylistWrapper>();

        // Query playlists and their associated songs
        List<Playlist__c> playlists = [
            SELECT Id, 
                (SELECT Id, Name, Artist__c, 
                (SELECT  ContentDocument.LatestPublishedVersionId FROM ContentDocumentLinks)
                 FROM Playlist_Songs__r)
            FROM Playlist__c
        ];

        for (Playlist__c playlist : playlists) {
            PlaylistWrapper pw = new PlaylistWrapper();
            pw.Songs = new List<SongWrapper>();

            // Add each song to the playlist wrapper
            for (Song__c song : playlist.Playlist_Songs__r) {
                SongWrapper sw = new SongWrapper();
                sw.Id = song.Id;
                sw.Name = song.Name;
                sw.Artist = song.Artist__c;

               if(!song.ContentDocumentLinks.isEmpty()){
                    String baseURL = URL.getOrgDomainUrl().toExternalForm();
                    String versionId = song.ContentDocumentLinks[0].ContentDocument.LatestPublishedVersionId;
                    sw.FileURL = baseURL + '/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb720by480&versionId=' + versionId;
               }
              if(sw.FileURL != null){
                pw.Songs.add(sw);
              }
              else{
                sw = new SongWrapper();
              }
            }

            playlistsWithSongs.add(pw);
        }

        return playlistsWithSongs;
    }

    public class PlaylistWrapper {
        @AuraEnabled public Id Id;
        @AuraEnabled public List<SongWrapper> Songs;
    }

    public class SongWrapper {
        @AuraEnabled public Id Id;
        @AuraEnabled public String Name;
        @AuraEnabled public String Artist;
        @AuraEnabled public String FileURL;
    }


}
