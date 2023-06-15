/*export function wsCli({ WebSocket, domain, port, ClientServer, data }) {
  const source = data.source;
  const url = `ws://${domain}:${port}?connectionKey=${source}`;
  //const url = `ws://localhost:3030?connectionKey=${source}`;

  const WS = ClientServer.createClientServer("websocket");
  const client = WS("client", source, url);

  const data = {
    destination: data.destination, //to subscribe to
    source: data.source, //to publish to
    data: data.data, //{ speed: 3, power: "56 watt" },
    command: data.command, //["create", "update", "stop"],
    extradata: data.extradata, // {},
  };

  client.setModel(data);

  client.connect(WebSocket);
  // client.send(WebSocket, data);
}
*/
//WEBSOCKET SERVER

let i = 0;
export function wsS({
  ClientServer,
  port,
  createServer,
  WebSocketServer,
  Callback,
}) {
  //const wss = new WebSocketServer({ server });
  const WS = ClientServer.createClientServer("websocket");
  const Server = WS("server");
  let ServerConnect;
  if (i <= 0) {
    ServerConnect = Server.serverSide(port, createServer, WebSocketServer, () =>
      console.log("listening on port " + port)
    );
    i++;
  }
  ServerConnect.execute("wss", {
    message: (data) => {
      Callback(data); //inside this will be redis
      console.log("received: %s", `message rx from user ${data}`);
    },
  });
}
