# CSCC09 24F Final Project: TODO: Title

$\quad$ Abstract $-$ TODO

## Group Members

| Name | Student Number | Email |
| ---- | -------------- | ----- |
| Zheyuan Wei | 1007626133 | <zheyuan.wei@mail.utoronto.ca> |

## Introduction

TODO: a description of the web application

Find demo at: [webtorrent.io](https://webtorrent.io/).
or: [wormhole](https://wormhole.app/)
We are to make a web application that allows users to share files with each other, but with better performance, security and user experience features compared to the demo.

## Features

### Core Features

TODO: a description of the key features that will be completed by the Beta version

### Additional Features

TODO: a description of the additional features that will be complete by the Final version

## Anticipated Challenges

TODO: a description of the top 5 technical challenges. Understand that a challenge is something new that you have to learn or figure out. Anything we have already covered in class cannot be considered as a challenge. Making the application work and deploying it is not a challenge but a project requirement.

## Design

TODO: a description of the technology stack that you will use to build and deploy it

We developed frontend on our own using React.js.

We utilize npm package [`webtorrent`](https://github.com/webtorrent/webtorrent) to do the functionalities job as they are not part of the marking scheme, but main constraint is that it relies on WebRTC which is not supported by all browsers, also relies on user to keep the browser open to seed a rare file.

One approach to tackle this is to use a smarter seeding technology, that is to distribute file chunks to multiple users even if they didn't request it, and now the sender can close the browser and the file will still be available to download. [wormhole-crypto](https://github.com/SocketDev/wormhole-crypto) is one option but looks dead.

## Optimization

TODO: later

## Benchmarking

TODO: later

## Discussion

*TODO*:

- Discuss advantages and disadvantages of our implementation.
- Address possible future world and optimization can be performed on this project architecture.

## Conclusion

In this project, TODO

## References

TODO: later
