/*
*  INDEX FILE FOR THE DISCORD BOT
*  This file is creating the discord bot and it reads in commands from the command sub-folder
*/

//Dependencies
import fs = require("fs");
import { Collection, CommandInteraction, CustomClient, Options } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes }  from "discord-api-types/v9";
import discordHelpers = require("../discord_helpers/index.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();
import ApplicationFactory = require("../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
applicationFactory.connect();
import log = require("../log/index.js");

let config: IConfig;
let client: CustomClient;

export = (_config: IConfig, _client: CustomClient) => {
  config = _config;
  client = _client;
  const commands = new Collection();

  setTimeout(() => {
    client.user.setActivity("your messages", {type: "LISTENING"});
    
    const commandFiles = fs.readdirSync("./discord_bot/commands").filter((file: string) => file.endsWith(".js"));
    for(const file of commandFiles) {
      const command = require(`./commands/${file}`);
      if(command.data) commands.set(command.data.name, command);
    }
  
    const rest = new REST({version: "9"}).setToken(config.discord_bot.bot_token);
  
    (async () => {
      try {
        log.write(0, "discord_bot", "start refreshing slash commands", {});

        let commandData: any = Array.from(commands.mapValues((x: any) => x.data.toJSON()).values());
        commandData = commandData.map((x: any) => {
          if(x.name === "admin") x.default_permission = false;
          return x;
        });
        
        await rest.put(Routes.applicationGuildCommands(config.discord_bot.application_id, config.discord_bot.guild) as unknown as `/${string}`,
          {body: commandData}
        ) as any[];
        
        const adminCommand = (await client.guilds.cache.get(config.discord_bot.guild).commands.fetch() as any).filter((x: any) => x.name === "admin").first();
        
        const permissions: any = [
          {
            id: config.discord_bot.roles.admin,
            type: "ROLE",
            permission: true,
          },
        ];

        await adminCommand.permissions.add({permissions});

      } catch(e) {
        log.write(3, "discord_bot", "refreshing slash commands failed", e);
      }
    })();

  }, 500);

  client.on("interactionCreate", async (interaction: CommandInteraction) => {
    if(!interaction.isCommand) return;
    const { commandName } = interaction as any;

    if(!commands.has(commandName)) return;

    try {
      await (commands.get(commandName) as any).execute(interaction);
    } catch (e) {
      log.write(3, "discord_bot", "Some Discord command just broke", {error: e.message, interaction: interaction});
      if(interaction.replied) {
        await interaction.editReply({ content: 'There was an error while executing this command!' });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!' });
      }
    }
  });
  
  client.on("guildMemberRemove", async user => {
    try {
      let member;
      try {
        member = await memberFactory.getByDiscordId(user.id);
      } catch(_) {}
      if(member) await member.delete();
      discordHelpers.sendMessage(`${user.displayName} left the server`, config.discord_bot.channel.mod_notifications);
    } catch(e) {
      discordHelpers.sendCrashMessage(e, "discord event handler");
      log.write(2, "discord_bot", "guildMemberRemove failed", {error: e.message, user: user.id});
    }
  });

  client.on("guildBanAdd", async ban => {
    try {
      let member;
      try {
        member = await memberFactory.getByDiscordId(ban.user.id);
      } catch(_) {}
      if(member) {
        await member.banInGame();
        await member.delete();
      }
      discordHelpers.sendMessage(`${ban.user.username} was banned from the server`, config.discord_bot.channel.mod_notifications);
    } catch(e) {
      discordHelpers.sendCrashMessage(e, "discord event handler");
      log.write(2, "discord_bot", "guildBanAdd failed", {error: e.message, user: ban.user.id});
    }
  });

  client.on("guildMemberAdd", async user => {
    try {
      discordHelpers.sendMessage(
        `Welcome <@${user.id}>! If you are here for joining the Minecraft server, then please read the <#${user.guild.channels.cache.find(channel => channel.name == "faq").id}> and read the rules at https://paxterya.com/rules. 
         You can then apply under https://paxterya.com/join-us\nIf you have any questions just ask in <#${user.guild.channels.cache.find(channel => channel.name == "support").id}>\nWe are looking forward to see you ingame :)`
        , config.discord_bot.channel.general
      );

      const application = await applicationFactory.getAcceptedByDiscordId(user.id);
      if(application?.length > 0) await application[0].acceptGuildMember();
    } catch(e) {
      discordHelpers.sendCrashMessage(e, "discord event handler");
      log.write(2, "discord_bot", "guildMemberAdd failed", {error: e.message, user: user.id});
    }
  });
};