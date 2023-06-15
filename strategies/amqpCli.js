export function amqpCli({ amqp, amqpS, PubSub, port, domain, callbacK }) {
  (async () => {
    let amqpPub = PubSub.createPubSub("amqp", amqp, port, domain);

    await amqpPub.connect();
    await amqpPub.createChannel();
    const { queue } = await amqpPub.assertQueue("");

    await amqpPub.consume(
      queue,
      (message) => {
        callbacK(message, amqpS);
        console.log(`[x] Received '${JSON.stringify(message)}'`);
      },
      { noAck: true }
    );
  })();
}

export function amqpS(amqp, port, domain, message) {
  (async () => {
    let amqpPub = PubSub.createPubSub("amqp", amqp, port, domain);

    await amqpPub.connect();
    await amqpPub.createChannel();

    await amqpPub.assertQueue(message.destination, { durable: false });
    await amqpPub.sendToQueue(message.destination, JSON.stringify(message));
    console.log(`[x] Sent '${JSON.stringify(message)}'`);
  })();
}
