import { isPrimary } from 'cluster';
import { Fleet } from '../../dist/index.js';
import { inspect } from 'util';
import { ServiceWorker } from "./service.mjs";
import { BotWorker } from './bot.mjs';
import { Intents } from 'oceanic.js';

import dotenv from "dotenv"
dotenv.config()

const options = {
    BotWorker,
    token: process.env.token,
    services: [{name: "myService", ServiceWorker}],
    clientOptions: {
        gateway:{
            intents: [Intents.GUILDS,Intents.GUILD_MESSAGES,Intents.MESSAGE_CONTENT]
        }
    }
}

const Admiral = new Fleet(options);

if (isPrimary) {
    // Code to only run for your master process
    Admiral.on('log', m => console.log(m));
    Admiral.on('debug', m => console.debug(m));
    Admiral.on('warn', m => console.warn(m));
    Admiral.on('error', m => console.error(inspect(m)));

    
    // Logs stats when they arrive
    Admiral.on('stats', m => console.log(m));
}