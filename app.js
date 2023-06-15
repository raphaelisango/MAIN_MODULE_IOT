/**
 * MAKE SURE BROKERS ARE RUNNING (RABBITMQ, MQTT OR MOSQUITO SERVER, )
 * MAKE SURE REDIS IS RUNNING
 * MAKE SURE ENVIRONEMENTAL VARIABLES ARE SET UP FOR DOMAIN AND PORT ON EACH PROTOCOL
 */

//DEPENDENCIES
import { createServer } from "http"; //WS
import { WebSocketServer } from "ws"; //WS
import { createClient } from "redis"; //redis
import { createRequire } from "module";
import { execa } from "execa";

const Require = createRequire(import.meta.url);
const xmpp = Require("simple-xmpp"); //XMPP
const amqp = Require("amqplib/callback_api"); //AMQP
var mqtt = Require("mqtt");

//3 MAIN MODULES
import ClientServer from "./client_server_iot/index.js";
import PubSub from "./pub_sub_iot/index.js";
import REDIS_PUBSUB from "./redis-pub-sub-server/index.js";

//STRATEGIES
import { redisPublish, redisSubscribe } from "./strategies/redisCli.js";
import { wsS } from "./strategies/wsCli.js";
import { amqpCli, amqpS } from "./strategies/amqpCli.js";
import { xmppCli } from "./strategies/xmppCli.js";
import { mqttS } from "./strategies/mqttCli.js";

// WS  COMMUNICATION......................................
(() => {
  wsS({
    ClientServer: ClientServer,
    port: 3030,
    createServer: createServer,
    WebSocketServer: WebSocketServer,
    Callback: (data) => {
      //redis publish
      if (
        data.source == null ||
        data.source == "" ||
        data.source == undefined
      ) {
        //DO NOTHING
      } else {
        redisPublish(REDIS_PUBSUB, createClient, data);
      }

      //redis subscribe
      if (
        data.destination == null ||
        data.destination == "" ||
        data.destination == undefined
      ) {
        //DO NOTHING
      } else {
        redisSubscribe({
          subtype: "pSubscribe",
          REDISPUBSUB: REDIS_PUBSUB,
          createclient: createClient,
          Callback: (message, channel) =>
            console.log("websocket routing embeded"),
        });
      }
    },
  });
})();

// XMPP  COMMUNICATION...................................

(() => {
  xmppCli({
    xmpp: xmpp,
    execa: execa,
    ClientServer: ClientServer,
    domain: "localhost",
    port: "5222",
    CallBack: (from, data, xmppSend) => {
      //redis publish
      if (
        data.source == null ||
        data.source == "" ||
        data.source == undefined
      ) {
        //DO NOTHING
      } else {
        redisPublish(REDIS_PUBSUB, createClient, data);
      }

      //redis subscribe
      if (
        data.destination == null ||
        data.destination == "" ||
        data.destination == undefined
      ) {
        //DO NOTHING
      } else {
        redisSubscribe({
          subtype: "pSubscribe",
          REDISPUBSUB: REDIS_PUBSUB,
          createclient: createClient,
          Callback: (message, channel) => {
            xmppSend(channel, "localhost", JSON.stringify(message));
            console.log("");
          },
        });
      }
    },
  });
})();

//AMQP COMMUNICATION ....................................
(() => {
  amqpCli({
    amqp: amqp,
    amqpS: amqpS,
    PubSub: PubSub,
    port: "5672",
    domain: "localhost",
    callbacK: (message, AmqpS) => {
      AmqpS(amqp, "5672", "localhost", message);
    },
  });
})();

//MQTT COMMUNICATION ....................................
(() => {
  mqttCli({
    mqtt: mqtt,
    PubSub: PubSub,
    port: "1883",
    domain: "localhost",
    topic: "#",
    mqtts: mqttS,
    callBack: (message, mqtts) => {
      mqtts(mqtt, PubSub, "1883", "localhost", message);
    },
  });
})();
