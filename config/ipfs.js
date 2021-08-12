const ipfs = {
  // repo: './dunp-' + Math.random(),                                                 // For testing
  start: true,                                                                        // TODO: is this needed?
  preload: {
    enabled: false
  },
  // relay: {
  //   enabled: true,
  //   hop: {
  //     enabled: true,
  //     active: true
  //   }
  // },
  // relay: {                                                                         // TODO: is this needed?
  //   enabled: false, // enable relay dialer/listener (STOP)
  //   hop: {
  //     enabled: false, // make this node a relay (HOP)
  //   },
  // },
  pubsub: true,                                                                       // TODO: is this needed?
  config: {
    Addresses: {
      Swarm: [
        // Use IPFS dev signal server
        // '/dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
        '/dns4/webrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star/',
        // Use local signal server
        // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
        // Use DSound signal server
        // '/dns4/signal.dsound.io/tcp/443/wss/p2p-webrtc-star/'
      ]
    },
    // Bootstrap: []
  }
};

export default ipfs;