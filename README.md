# txt-bot-and-server
The node.js server that runs the Paxterya website (https://paxterya.com) and our Discord bot.

# technologies
The backend and Discord Bot portion is written in typescript running on node.js and the frontend is written in nuxt.js.

# reuse
While parts of this software might be helpful, it's impossible to reuse without modifications.
If you know what you are doing, then you can probably change some things around or just look at how we did certain things (I would mostly not recommend that).

# run locally
To run this locally just clone the repo and then prepare the backend and nuxt_frontend portions.

Backend:  
Run `npm i --dev` this should take care of all dependencies.  
Then you need to run `npm run compile` to start a tsc instance running in watch mode.
After that you can copy `config-example.js` to `config.js` and customize all the options. The default mode will be staging, unless you use another NODE_ENV.

Nuxt_frontend:  
Run `npm i --dev` to pull all dependencies.  
To start you just need to run `npm run dev`.

# contact
If you have any question just DM me on Discord (TxT#0001) or join the Paxterya Discord server (https://discord.gg/mAjZCTG). Please use the channels in the development section.
