import Discord = require("discord.js");
import discordHelpers = require("../../discord_helpers/index.js");
import MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

const supportedPronouns = ["she", "he", "they", "it"];

export = {
  name: "suffix",
  description: "Used to set or remove suffixes",
  usage: `pronouns set ${supportedPronouns.join("/")} OR pronouns remove OR timezone set +2 <- UTC Offset OR timezone remove`,

  async execute(message: Discord.Message, args: string[]) {
    if(args[1] === "set" || args[1] === "remove") {
      await figureSuffixTypeOut(message, args);
    } else {
      await message.channel.send("Invalid operation! Use set OR remove");
    }
  }
};

async function figureSuffixTypeOut(message: Discord.Message, args: string[]) {
  switch(args[0]) {
    case "pronouns": {
      return await pronouns(message, args);
    }
    case "timezone": {
      return await timezone(message, args);
    }
    default: {
      return await message.channel.send("Please use the help command to get help, you really seem to need it ;)")
    }
  }
}



async function pronouns(message: Discord.Message, args: string[]){
  if(args[1] === "set") {
    if(!supportedPronouns.includes(args[2])) {
      message.channel.send("I'm sorry, I don't know that pronoun yet :(\nMaybe you should tell TxT about it, so he can add it?");
      return;
    }
    await setPronoun(message.guild.members.get(message.author.id), args[2]);
  } else if (args[1] === "remove") {
    await removePronoun(message.guild.members.get(message.author.id));
  }
}

async function setPronoun(member: Discord.GuildMember, pronoun: string) {
  const user = await memberFactory.getByDiscordId(member.id);
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

async function removePronoun(member: Discord.GuildMember) {
  const user = await memberFactory.getByDiscordId(member.id);
  let suffix = ""
  if(user.getSuffix()?.length > 0 && user.getSuffix().includes("|")) {
    suffix = user.getSuffix().split("|")[1].trim();
  } 
  user.setSuffix(suffix)
  await user.save();
  
  await updateSuffix(user.getDiscordId(), user.getMcIgn(), suffix);
}



async function timezone(message: Discord.Message, args: string[]){
  if(args[1] === "set") {
    args[2] += " ";
    if(!args[2].match(/[+-]([0-9][,.]((5)|(25)|(75))|[0-9][0-2][,.]((5)|(25)|(75))|[0-9]|[0-9][0-2])[ ]/)) {
      message.channel.send("Um I don't think that is a valid utc offset. Try something like +2 or -10.5 or +0 instead");
      return;
    }
    await setTimezone(message.guild.members.get(message.author.id), args[2].trim());
  } else if(args[1] === "remove") {
    await removeTimezone(message.guild.members.get(message.author.id));
  }
}

async function setTimezone(member: Discord.GuildMember, timezone: string) {
  const user = await memberFactory.getByDiscordId(member.id);
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

async function removeTimezone(member: Discord.GuildMember) {
  const user = await memberFactory.getByDiscordId(member.id);
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