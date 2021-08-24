import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import discordHelpers = require("../../discord_helpers/index.js");
import MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

const supportedPronouns = ["she", "he", "they", "it"];

export = {
  data: new SlashCommandBuilder()
        .setName("suffix")
        .setDescription("edit the suffix of your username")
        .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
                      .setName("timezone")
                      .setDescription("Configure timezone suffix")
                      .addSubcommand(new SlashCommandSubcommandBuilder()
                                    .setName("set")
                                    .setDescription("sets a new timezone as your suffix")
                                    .addStringOption(new SlashCommandStringOption()
                                                    .setName("utc_offset")
                                                    .setDescription("your offset in hours from utc (for example +10, -2, +0, -4.5)")               
                                                    .setRequired(true)
                                    )
                      )
                      .addSubcommand(new SlashCommandSubcommandBuilder()
                                    .setName("remove")
                                    .setDescription("removes the timezone from your suffix")
                      )
        )
        .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
                      .setName("pronouns")
                      .setDescription("Configure pronouns suffix")
                      .addSubcommand(new SlashCommandSubcommandBuilder()
                                    .setName("set")
                                    .setDescription("sets new pronouns as your suffix")
                                    .addStringOption(new SlashCommandStringOption()
                                                    .setName("pronouns")
                                                    .setDescription("the pronouns you would like to get refered with")               
                                                    .setRequired(true)
                                                    .addChoices(supportedPronouns.map(x => [x, x]))
                                    )
                      )
                      .addSubcommand(new SlashCommandSubcommandBuilder()
                                    .setName("remove")
                                    .setDescription("removes the pronouns from your suffix")
                      )
        ),
  async execute(interaction: CommandInteraction) {
    if(!interaction.isCommand()) return null;
    switch(interaction.options.getSubcommandGroup()) {
      case "pronouns": {
        await interaction.reply("Setting up your new suffix...");
        await pronouns(interaction);
        return await interaction.editReply("Done! Enjoy your new suffix (:");
      }
      case "timezone": {
        await interaction.reply("Setting up your new suffix...");
        try {
          await timezone(interaction);
          return await interaction.editReply("Done! Enjoy your new suffix (:");
        } catch (e) {
          return await interaction.editReply(e.message);
        }
      }
      default: return null;
    }
  }
};

async function pronouns(interaction: CommandInteraction){
  switch(interaction.options.getSubcommand()) {
    case "set": {
      return await setPronoun(interaction.user.id, interaction.options.getString("pronouns"));
    }
    case "remove": {
      return await removePronoun(interaction.user.id);
    }
  }
}

async function setPronoun(userId: string, pronoun: string) {
  const user = await memberFactory.getByDiscordId(userId);
  let suffix = pronoun;
  if(typeof user.getSuffix() == "string" && user.getSuffix().length > 0 && (user.getSuffix().includes("|") || user.getSuffix().includes("utc"))) {
    suffix += " | ";
    if(user.getSuffix().split("|").length > 1) {
      suffix += user.getSuffix().split("|")[1].trim();
    } else {
      suffix += user.getSuffix().trim();
    }
  }
  user.setSuffix(suffix);
  await user.save();
  
  await updateSuffix(user.getDiscordId(), user.getMcIgn(), suffix);
}

async function removePronoun(userId: string) {
  const user = await memberFactory.getByDiscordId(userId);
  let suffix = ""
  if(user.getSuffix()?.length > 0 && user.getSuffix().includes("|")) {
    suffix = user.getSuffix().split("|")[1].trim();
  } 
  user.setSuffix(suffix)
  await user.save();
  
  await updateSuffix(user.getDiscordId(), user.getMcIgn(), suffix);
}



async function timezone(interaction: CommandInteraction){
  switch(interaction.options.getSubcommand()) {
    case "set": {
      return await setTimezone(interaction.user.id, interaction.options.getString("utc_offset"));
    }
    case "remove": {
      return await removeTimezone(interaction.user.id);
    }
  }
}

async function setTimezone(userId: string, timezone: string) {
  const user = await memberFactory.getByDiscordId(userId);
  if(!timezone.match(/[+-]([0-9][,.]((5)|(25)|(75))|[0-9][0-2][,.]((5)|(25)|(75))|[0-9]|[0-9][0-2])/)) {
    throw new Error("Um I don't think that is a valid utc offset. Try something like +2 or -10.5 or +0 instead");
  }
  
  let suffix = "";
  if(typeof user.getSuffix() == "string" && user.getSuffix().length > 0 && (user.getSuffix().includes("|") || !user.getSuffix().includes("utc"))) {
    suffix += user.getSuffix().split("|")[0].trim();
    suffix += " | ";
  }
  suffix += `utc${timezone}`;
  user.setSuffix(suffix);
  await user.save();
  
  await updateSuffix(user.getDiscordId(), user.getMcIgn(), suffix);
}

async function removeTimezone(userId: string) {
  const user = await memberFactory.getByDiscordId(userId);
  let suffix = "";
  if(user.getSuffix()?.length > 0 && user.getSuffix().includes("|")) {
    suffix = user.getSuffix().split("|")[0].trim();
  }
  user.setSuffix(suffix);
  await user.save();
  
  await updateSuffix(user.getDiscordId(), user.getMcIgn(), suffix);
}

async function updateSuffix(userId: string, ign: string, suffix: string) {
  let nickname = ign;
  if(suffix) nickname += ` [${suffix}]`;
  await discordHelpers.setNickname(userId, nickname);
}