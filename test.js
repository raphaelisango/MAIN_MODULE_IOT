import ClientServer from "./client_server_iot/index.js";
import PubSub from "./pub_sub_iot/index.js";
import REDIS_PUBSUB from "./redis-pub-sub-server/index.js";
import { execa } from "execa";

import { createRequire } from "module";
const Require = createRequire(import.meta.url);
const amqp = Require("amqplib/callback_api"); //AMQP

import { createServer } from "http"; //WS
import { WebSocketServer } from "ws"; //WS

import { createClient } from "redis"; //REDIS

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
//REDIS PUB ...............................................................................
(async () => {
  let data = {
    destination: "raphael", //to subscribe to
    source: "percymiler", // to publish to
    data: { speed: 5555, power: "5555 watt" },
    command: ["create", "update", ""],
    extradata: {},
  };
  const pub = REDIS_PUBSUB("pub", createClient);
  await pub.connect();
  await pub.publish(data.source, JSON.stringify(data));
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
  server.User("register", {
    name: "percy",
    host: "localhost",
    password: "12345",
  });
})();
