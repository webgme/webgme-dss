export default function saveUrlToDisk(fileURL, fileName) {
    // for non-IE
    if (!window.ActiveXObject) {
        var save = document.createElement('a');
        //event = document.createEvent('Event');

        save.href = fileURL;
        save.target = '_self';

        if (fileName) {
            save.download = fileName;
        }

        // event.initEvent('click', true, true);
        // save.dispatchEvent(event);
        // (window.URL || window.webkitURL).revokeObjectURL(save.href);
        save.click();
    } else if (!!window.ActiveXObject && document.execCommand) {
        // for IE
        var _window = window.open(fileURL, '_self');
        _window.document.close();
        _window.document.execCommand('SaveAs', true, fileName || fileURL);
        _window.close();
    }
}

export function downloadBlobArtifact(hash) {
    let blobClient = new window.GME.classes.BlobClient();
    return blobClient.getMetadata(hash)
        .then(metadata => {
            saveUrlToDisk(blobClient.getDownloadURL(hash, metadata.name));
        });
}