// import WebTorrent from "webtorrent";

const client = new WebTorrent();

const torrentId =
    "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent";
console.log("Downloading torrent: " + torrentId);
client.add(torrentId, function (torrent) {
    // Torrents can contain many files. Let's use the .mp4 file
    const file = torrent.files.find(function (file) {
        return file.name.endsWith(".mp4");
    });

    if (!file) {
        console.log("No .mp4 file found in torrent");
        return;
    }

    console.log("Downloading: " + file.name);

    torrent.on("download", (bytes) => {
        console.log(`Progress: ${(torrent.progress * 100).toFixed(2)}%`);
    });

    torrent.on("done", () => {
        console.log("Download finished.");
        file.appendTo("body", (err) => {
            if (err) console.error("Error appending file:", err);
            else console.log("File successfully added to DOM");
        });
    });

    // Display the file by adding it to the DOM. Supports video, audio, image, etc. files
    file.appendTo("body");
});
