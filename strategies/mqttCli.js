export function mqttCli({
  mqtt,
  PubSub,
  port,
  domain,
  topic,
  mqtts,
  callBack,
}) {
  (() => {
    let mqttSub = PubSub.createPubSub("mqtt", mqtt, port, domain, "Sub");

    mqttSub.On("connect", {
      topic: topic,
    });

    mqttSub.On("message", {
      OnMsgCallback: (topic, message) => {
        //redispush
        callBack(message, mqtts);
        console.log("From all topics " + JSON.parse(message));
      },
    });
  })();
}

export function mqttS(mqtt, PubSub, port, domain, data) {
  (() => {
    let mqttpub = PubSub.createPubSub("mqtt", mqtt, port, domain, "Pub");
    mqttpub.On("connect", {
      destination: data.destination, //to subscribe to
      source: data.source, // to publish to
      data: data.source,
      command: data.command,
      extradata: data.extradata,
    });
    //console.log(mqttpub);
  })();
}
