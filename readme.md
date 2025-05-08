# WebToWeb

This repo is a browser-based BitTorrent client for fast file sharing.
The client used [Remix](https://remix.run/) and [WebTorrent](https://github.com/webtorrent/webtorrent).

Access the web app at: <https://w2w.space/>

---

Originally a [CSCC09](https://thierrysans.me/CSCC09/) course project at the [UTSC](https://www.utsc.utoronto.ca/cms/), under the supervision of [Prof. Thierry Sans](https://thierrysans.me/).

## Why W2W

Case:
> Transfer a file to a **public** computer (e.g., university lab, library, classroom, etc.) without logging in to any service.

**Why don't I use a social media platform?**

- **Privacy**: I don't want to log in to my social media account on a public computer.

**Why don't I use a cloud storage service?**

- **Privacy**: I don't want to log in to my cloud storage account on a public computer.
- **Speed**: Some cloud storage services set limits on **file size** and **transfer speed**.
- **Still Speed**: File first upload to the server, then download from the server. Take twice the time. P2P **utilizes the whole bandwidth** and doesn't have a file size limit.

**OK, why don't I use a random online file transfer website?**

- **Security**: I don't want to upload my file to a **random third-party server**. P2P network **does not store files**. You will also see number of peers during the transfer process, to ensure that your file is been transferred **only to the intended recipient**.
- **Speed**: Most free online file transfer websites have a file **size limit** (e.g., 2GB), and a **transfer speed limit** (e.g., 1MB/s), because traditional storage services pay for both the storage and the bandwidth. P2P server **don't store or transfer files**, so no such limits.
- **Still Speed**: Same as above.
- **URL**: Yes, you upload your file to the random website and receive a **super long URL** (e.g., `https://*.com/downloads/626be05630b03e9fc71b23121581cf06`), what then? Type them in the destination computer, or use social media, Email... All of them require you to log in to a service. P2P **does not require any login**. You can just copy the **6-digit token** (e.g., `123456`) and type it in the destination computer. No need to log in to any service, no hassling with long URLs.

**Summary**

Good stuff:

- No need to log in to any service: **keep account safe**
- No need to install any software: **quick**
- No passthrough via a third-party server: **keep file safe**
- No need to type long URLs: **easy to use**
- No waiting for upload before download: **fast**
- No file size limit
- No transfer speed limit

Constraints:

- **WebRTC**: Compatible with most modern browsers (Chrome, Firefox, Safari, Edge, Opera, etc.), but not all.
- **P2P**: Only works when both computers are online. If one of them is offline, the transfer will be interrupted. You can use the **token** to resume the transfer later.
- **Network**: Network is complex. If you are using a **restricted network** (e.g., university, company, some public networks, etc.), the network firewall may block P2P traffic. Some ISPs may also block P2P traffic.
- **Security**: WebTorrent is a **public protocol**. Anyone can download the file with the magnet link. So consider using the token instead of the magnet link. The tracker server also gets to know the **metadata** of the file (e.g., file name, file size, etc.). However, normally this won't be a concern, since the scenario is to transfer files to a **public computer**, which is already public.
- **Performance**: Again, network is complex. The performance of P2P transfer depends on the network condition and structure.

## TODO

- [ ] Improve UI text to be more descriptive
- [ ] Improve UI to prevent accidental page refresh/leave
- [ ] Add JWT validation
- [ ] Add expiration for tokens
- [ ] Multi-device sync (i.e., the fetch is now triggered on routing event)
- [ ] Resolve console complains

## Features

- [x] File upload/download
- [x] Token-based file access
- [x] Google OAuth integration
