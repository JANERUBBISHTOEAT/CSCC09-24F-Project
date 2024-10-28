// import WebTorrent from "https://esm.sh/webtorrent";
import WebTorrent from "./webtorrent.min.js";

const client = new WebTorrent();

// Sintel, a free, Creative Commons movie
const torrentId =
    "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent";

// see tutorials.md for a full example of streaming media using service workers
navigator.serviceWorker.register("sw.min.js");
const controller = await navigator.serviceWorker.ready;
client.createServer({ controller });

client.add(torrentId, (torrent) => {
    // Torrents can contain many files. Let's use the .mp4 file
    const file = torrent.files.find((file) => {
        return file.name.endsWith(".mp4");
    });

    // Display the file by adding it to the DOM.
    // Supports video, audio, image files, and more!
    file.streamTo(document.querySelector("video"));

    const progress_div = document.getElementById("progress");
    const down_speed_div = document.getElementById("down_speed");
    const up_speed_div = document.getElementById("up_speed");
    const peers_div = document.getElementById("peers");

    torrent.on("download", (bytes) => {
        console.log(`Progress: ${(torrent.progress * 100).toFixed(2)}`);
        progress_div.innerHTML = `Progress: ${(torrent.progress * 100).toFixed(
            2
        )}%`;
        down_speed_div.innerHTML = `Download speed: ${prettyBytes(
            torrent.downloadSpeed
        )}/s`;
        up_speed_div.innerHTML = `Upload speed: ${prettyBytes(
            torrent.uploadSpeed
        )}/s`;
        peers_div.innerHTML = `Peers: ${torrent.numPeers}`;
    });

    torrent.on("done", () => {
        console.log("Download finished.");
    });
});

const clear_btn = document.getElementById("clear");
clear_btn.addEventListener("click", () => {
    client.remove(torrentId, { destroyStore: true }, (err) => {
        if (err) {
            console.error("Failed to remove the torrent:", err);
        } else {
            console.log("Torrent removed and its data deleted successfully.");
        }
    });
});

// Human readable bytes util
function prettyBytes(num) {
    const units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const neg = num < 0;
    if (neg) num = -num;
    if (num < 1) return (neg ? "-" : "") + num + " B";
    const exponent = Math.min(
        Math.floor(Math.log(num) / Math.log(1000)),
        units.length - 1
    );
    const unit = units[exponent];
    num = Number((num / Math.pow(1000, exponent)).toFixed(2));
    return (neg ? "-" : "") + num + " " + unit;
}
