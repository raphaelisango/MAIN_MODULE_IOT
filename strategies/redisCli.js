export function redisPublish(REDISPUBSUB, createclient, data) {
  (async (REDIS_PUBSUB, createClient, data) => {
    let data = {
      destination: data.destination, //to subscribe to
      source: data.source, // to publish to
      data: data.data,
      command: data.command,
      extradata: data.extradata,
    };
    const pub = REDIS_PUBSUB("pub", createClient);
    await pub.connect();
    await pub.publish(data.source, JSON.stringify(data));
  })(REDISPUBSUB, createclient, data);
}

export function redisSubscribe({
  subtype,
  REDISPUBSUB,
  createclient,
  CallbacK,
  destination,
}) {
  (async () => {
    const sub = REDISPUBSUB("sub", createclient);
    await sub.connect();
    const listener = (message, channel) => {
      CallbacK(message, channel);
      console.log("SUB >>> " + JSON.parse(message), channel);
    };
    switch (subtype) {
      case "subscribe":
        await sub.subscribe(destination, listener);
        break;

      case "pSubscribe":
        await sub.pSubscribe(destination, listener);
        break;

      default:
        console.error("DOES'NT EXIST");
        break;
    }
  })();
}
