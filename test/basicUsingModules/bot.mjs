import {BaseClusterWorker} from '../../dist/index.js';

class BotWorker extends BaseClusterWorker {
    constructor(setup) {
        // Do not delete this super.
        super(setup);

        this.bot.on('messageCreate', this.handleMessage.bind(this));
    }

    async handleMessage(msg) {
        if (msg.content === "!ping" && !msg.author.bot) {
            this.bot.rest.channels.createMessage(msg.channelID, {content: "Pong!"});
			const data = await this.ipc.clusterCommand(0, null, true)
        }
    }

	handleCommand() {
		// Optional function to return data from this cluster when requested
		return "hello!"
	}

    shutdown(done) {
        // Optional function to gracefully shutdown things if you need to.
        done(); // Use this function when you are done gracefully shutting down.
    }
}

export {BotWorker}