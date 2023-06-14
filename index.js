import ClientServer from "./client_server_iot/index.js";
import PubSub from "./pub_sub_iot/index.js";
import REDIS_PUBSUB from "./redis-pub-sub-server/index.js";
import { createClient } from "redis";
import { createRequire } from "module";
const Require = createRequire(import.meta.url);

import WebSocket from "ws";
import { execa } from "execa";

const amqp = Require("amqplib/callback_api");
//MQTT Sub TEST....................................................................
(() => {
  return;
  var mqtt = Require("mqtt");
  let mqttSub = PubSub.createPubSub("mqtt", mqtt, "1883", "localhost", "Sub");

  mqttSub.On("connect", {
    topic: "percymiler",
  });

  mqttSub.On("message", {
    OnMsgCallback: (topic, message) => {
      //redispush
      console.log(JSON.parse(message));
    },
  });
})();

//AMQP SUB TEST....................................................................
(async () => {
  return;
  let amqpPub = PubSub.createPubSub("amqp", amqp, "5672", "localhost");

  await amqpPub.connect();
  await amqpPub.createChannel();

  await amqpPub.consume(
    "percymiler",
    (message) => {
      console.log(`[x] Received '${message.content.toString()}'`);
    },
    { noAck: true }
  );
})();

//WEBSOCKET CLIENT
(() => {
  const source = "percymiler";
  const url = `ws://localhost:3030?connectionKey=${source}`;

  const WS = ClientServer.createClientServer("websocket");
  const client = WS("client", source, url);

  const data = {
    destination: "5555", //to subscribe to
    source: source, //to publish to
    data: { speed: 3, power: "56 watt" },
    command: ["create", "update", "stop"],
    extradata: {},
  };

  client.setModel(data);

  client.connect(WebSocket);
  // client.send(WebSocket, data);
})();

//REDIS SUB......................................................................

(async () => {
  const sub = REDIS_PUBSUB("sub", createClient);
  await sub.connect();
  const listener = (message, channel) =>
    console.log(JSON.parse(message), channel);
  await sub.subscribe("percymiler", listener);
  await sub.pSubscribe("percymiler*", listener);
})();

//XMPP CLIENT A ..............................................................................
(() => {
  const xmpp = Require("simple-xmpp");
  const Xmpp = ClientServer.createClientServer("xmpp");

  const message = {
    destination: "percy@localhost", //to subscribe to
    source: "qwerty@localhost", //to publish to
    data: { speed: 3, power: "56 watt" },
    command: ["create", "update", "stop"],
    extradata: {},
  };

  const server = Xmpp(xmpp, execa, 5222, "localhost");
  server.On("error", (error) => console.log(`something went wrong!${error} `));
  server.On("online", (data) => {
    setInterval(() => {
      server.Send("percy", "localhost", JSON.stringify(message));
      console.log("sent ", message);
    }, 2000);
  });

  server.connect({
    jid: message.destination, //to connect to
    password: "12345",
    host: "localhost",
    port: 5222,
  });
})();
