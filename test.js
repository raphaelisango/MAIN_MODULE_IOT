import ClientServer from "./client_server_iot/index.js";
import PubSub from "./pub_sub_iot/index.js";
import REDIS_PUBSUB from "./redis-pub-sub-server/index.js";

import { createRequire } from "module";
const Require = createRequire(import.meta.url);
const amqp = Require("amqplib/callback_api"); //AMQP

import { createServer } from "http"; //WS
import { WebSocketServer } from "ws"; //WS

//MQTT PUB TEST....................................................................
(() => {
  return;
  var mqtt = Require("mqtt");

  let mqttpub = PubSub.createPubSub("mqtt", mqtt, "1883", "localhost", "Pub");
  mqttpub.On("connect", {
    destination: "raphael", //to subscribe to
    source: "percymiler", // to publish to
    data: { speed: 5555, power: "5555 watt" },
    command: ["create", "update", ""],
    extradata: {},
  });

  setInterval(() => {
    mqttpub.publish({
      destination: "raphael", //to subscribe to
      source: "percymiler", // to publish to
      data: { speed: 5555, power: "5555 watt" },
      command: ["create", "update", ""],
      extradata: {},
    });
  }, 3000);
  //console.log(mqttpub);
})();
//AMQP PUB TEST....................................................................
(async () => {
  return;
  let amqpPub = PubSub.createPubSub("amqp", amqp, "5672", "localhost");

  await amqpPub.connect();
  await amqpPub.createChannel();

  //const queue = "hello";
  const message = {
    destination: "raphael", //to subscribe to
    source: "percymiler", // to publish to
    data: { speed: 5555, power: "5555 watt" },
    command: ["create", "update", ""],
    extradata: {},
  };

  await amqpPub.assertQueue(message.source, { durable: false });

  await setInterval(() => {
    amqpPub.sendToQueue(message.source, JSON.stringify(message));
    console.log(`[x] Sent '${JSON.stringify(message)}'`);
  }, 3000);
})();
//WEBSOCKET SERVER
(() => {
  //const wss = new WebSocketServer({ server });
  const WS = ClientServer.createClientServer("websocket");
  const Server = WS("server");
  Server.serverSide(3030, createServer, WebSocketServer, () =>
    console.log("listening on port 3030")
  ).execute("wss", {
    message: (data) => {
      console.log("received: %s", `message rx from user ${data}`);
    },
  });
})();
