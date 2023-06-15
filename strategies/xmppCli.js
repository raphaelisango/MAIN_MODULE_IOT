export function xmppCli({ xmpp, execa, ClientServer, domain, port, CallBack }) {
  //XMPP CLIENT A ..............................................................................
  let i = 0;
  (async () => {
    const Xmpp = ClientServer.createClientServer("xmpp");
    /** 
    const message = {
      destination: data.destination, //to subscribe to
      source: data.source, //to publish to
      data: data.data, //{ speed: 3, power: "56 watt" },
      command: data.command, //["create", "update", "stop"],
      extradata: data.extradata, // {},
    };*/

    const server = Xmpp(xmpp, execa, port, domain);
    server.On("error", (error) =>
      console.log(`something went wrong!${error} `)
    );

    if (i <= 0) {
      await server.User("register", {
        name: data.source,
        host: `${domain}`,
        password: "12345",
      });
      i++;
    }

    await server.connect({
      jid: `${data.source}@${domain}`, //to connect to
      password: "12345",
      host: `${domain}`,
      port: `${port}`, //5222
    });

    server.On("chat", function (from, message) {
      CallBack(from, message, server.Send);
      console.log("%s message from  %s" + from + " : " + message);
    });

    server.On("online", function (data) {
      console.log("Yes, I'm online");
    });
  })();
}
