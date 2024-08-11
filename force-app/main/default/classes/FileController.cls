public with sharing class FileController {
    @AuraEnabled(cacheable=true)
    public static String getMp3FileBase64() {
        // Query the ContentVersion to get the VersionData (Base64-encoded)
        ContentVersion cv = [SELECT VersionData FROM ContentVersion WHERE ContentDocumentId = '069F900000Qv3OUIAZ' LIMIT 1];
        // Return the Base64-encoded data as a string
        return EncodingUtil.base64Encode(cv.VersionData);
    }
}
