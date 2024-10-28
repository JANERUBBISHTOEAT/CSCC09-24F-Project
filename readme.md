# CSCC09 24F Final Project - WebToWeb: A Secure Web Implementation for P2P File Sharing

$\quad$ This paper presents a browser-based BitTorrent client with encrypted file-sharing functionality. The client will leverage [Remix](https://remix.run/) and [WebTorrent](https://github.com/webtorrent/webtorrent) for the frontend, with backend deployment on Google Cloud Platform. Project evaluation will focus on performance, security, and user experience.

## Group Members

| Name | Student Number | Email |
| ---- | -------------- | ----- |
| Zheyuan Wei | 1007626133 | <zheyuan.wei@mail.utoronto.ca> |

## Introduction

[WebToWeb](#introduction) will be a web application designed for secure, fast file sharing through a peer-to-peer (P2P) system. Unlike traditional methods requiring files to upload to a server before download, which can be slow and less secure, this app allows direct user-to-user file transfer, significantly enhancing speed. Additionally, encryption ensures high security for all shared files on the P2P network.

A demonstration was already found at [webtorrent.io](https://webtorrent.io/) illustrates certain limitations in the current implementation: files are shared directly between users without encryption, posing security risks; file size is constrained by browser memory; and files are lost if the sender closes the browser. [WebToWeb](#introduction) seeks to resolve these issues by developing a more advanced, secure, and user-friendly P2P file-sharing application.

## Features

### Core Features / Beta Version

The beta version of application will incorporate following features (in order of priority):

#### File Transfer

- An improved WebUI for file upload and download, allowing users to upload files and receive a unique access link.
- Users can upload files and receive a unique link for access.
- Users may download files by entering the unique link.
- File integrity is ensured by performing a hash check before and after transfer.
- Face-to-face file sharing by scanning QR codes or other methods.

### Additional Features / Final Version

The final version of the application will incorporate the following additional features:

#### File Transfer

- Large files are split into chunks to accommodate browser memory constraints.
- Reassembling file chunks seamlessly on the recipient's end.
- Receivers can download the file before fully uploaded: streaming / chunking.
- Establish multiple P2P links to expedite download speed.*
- Distributing chunks to multiple users to enhance download speed.*
- Senders may close the browser and the file will still be available to download: advanced seeding.*

#### Security

- Files are encrypted by senders prior to upload, generating a unique decryption key.
- Receivers use this key to decrypt the file upon download.
- Embed keys directly within `magnet` links and `.Torrent` files for secure sharing.
- OAuth, MFA, local authentication are integrated on demand for enhanced security measures.
- Time-based one-time password (TOTP) for key exchange.*

> Features marked with an asterisk (*) require proof of concept to verify feasibility and may be subject to change.
> Within the scope of the course, [WebToWeb](#introduction) will prioritize core features, with additional implementations as time allows.

## Design / Technology Stack

### Design Overview

![System_Design](./System_Design.svg)
>

### Frontend

- `Remix` will be used for the frontend.
- `webtorrent` will be used for the P2P file-sharing functionality.
- Google Cloud Platform will be used for deployment.

### Backend

- Google Cloud Platform will be used for backend deployment.

### Libraries

We independently developed the frontend using `Remix` and implemented functionality with the `webtorrent` npm package.

#### Library Comparison

`webtorrent` utilizes one of the traditional P2P file-sharing protocols, BitTorrent, as a foundation. While BitTorrent is more trust-worthy and supports large-scale public file-sharing in extensive user networks, it may not be ideal for our application, which requires secure, private and small-scale file sharing.

A more specialized and suitable P2P method could support small group sharing, allowing senders to disconnect while files remain accessible. Though [wormhole-crypto](https://github.com/SocketDev/wormhole-crypto) could serve this need, it appears inactive for over a year, raising concerns about its reliability.

## Anticipated Challenges

Potential challenges may arise in developing [WebToWeb](#introduction), some of which may eventually be deemed unfeasible within the course scope and subject to adjustment.

1. **Objective Challenge**: This project aims to develop a secure, efficient, and user-friendly P2P file-sharing application as a faster and safer alternative to existing cloud services like Google Drive, Dropbox, and OneDrive, addressing potential concerns about the need for such a solution in a market dominated by traditional options.

2. **WebTorrent Limitations**: As shown in the picture, WebTorrent clients are not fully connected to the desktop BitTorrent clients, rather going through a kind of "adapter". This may limit the number of users who can access the application.

   ![Nwtwork](https://camo.githubusercontent.com/ad3fe62845574fe458a186fe76055198fc2d896fc5f50241c7993403e21f9a86/68747470733a2f2f776562746f7272656e742e696f2f696d672f6e6574776f726b2e706e67)

    Additionally, a controversial issue was discussed in [Library Comparison](#library-comparison) section.

3. **WebRTC Limitations**: WebRTC is not supported by all browsers, which may limit the number of users who can access the application. An incomplete list of known supported browsers can be found on [Wikipedia](https://caniuse.com/mdn-api_webrtc).
    Most major desktop browsers are supported:
   - Microsoft Edge 12+
   - Google Chrome 28+
   - Mozilla Firefox 22+
   - Safari 11+
   - Opera 18+
   - Vivaldi 1.9+
   - Brave

4. **File Chunking**: Splitting large files into smaller chunks and reassembling them on the recipient's end may be challenging.
   - WebTorrent may lack native chunking support, necessitating custom implementation.
   - Ensuring file integrity during chunking and reassembly is crucial.
   - Streaming files before fully uploaded may require additional work.

5. **Advanced Seeding**: Distributing file chunks to multiple users needs to confirm feasibility. This may not be possible with Torrent protocol.
   - The feasibility of establishing multiple P2P links to expedite download speed is uncertain.
   - Ensuring file availability after the sender closes the browser requires active seeding by volunteer users or a server.
   - Distributing chunks to users who did not request them may not align current WebTorrent protocol.

6. **Security**: Implementing encryption and decryption for file sharing is crucial for user privacy and data security.
    - Ensure that the key exchange is secure.
    - Integrating OAuth, MFA, and local authentication may require additional work.

## Optimization

TODO: move Additional Features to Optimization after implementation

## Benchmarking

TODO: later

## Discussion

*TODO*:

- Discuss advantages and disadvantages of our implementation.
- Address possible future world and optimization can be performed on this project architecture.

## Conclusion

TODO: later

## References

TODO: later
