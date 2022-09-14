import { BaseClusterWorker } from '../../dist/index.js';

class BotWorker extends BaseClusterWorker {
    constructor(setup) {
        // Do not delete this super.
        super(setup);

        this.bot.on('messageCreate', this.handleMessage.bind(this));
    }

    async handleMessage(msg) {
        if (msg.content === "!sendCommand" && !msg.author.bot) {
            // Sends a command to the example service: "myService"
            const reply = await this.ipc.command("myService", {smileyFace: ":)"}, true);
            //console.log(reply);
            this.bot.rest.channels.createMessage(msg.channelID, {content: reply});
        }
    }

    shutdown(done) {
        // Optional function to gracefully shutdown things if you need to.
        done(); // Use this function when you are done gracefully shutting down.
    }
}

export {BotWorker}