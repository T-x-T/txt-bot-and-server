const Persistable = require("../persistance/persistable.js");
const discord_api = require("../discord_api");
const discord_helpers = require("../discord_bot/helpers.js");

class User extends Persistable{
  constructor(discord_id, discord_nick, status, joinedDate, karma){
    super({name: "members", schema: User.schema});

    this.data.discord = discord_id;
    this.data.discord_nick = discord_nick;
    this.data.status = User.isValidStatus(status) ? status : 0;
    this.data.joinedDate = joinedDate ? joinedDate : new Date();
    this.data.karma = karma;
  }

  getDiscordId(){
    return this.data.discord;
  }

  getJoinedDate(){
    return this.data.joinedDate;
  }

  setDiscordNick(newDiscordNick){
    if(typeof newDiscordNick != "string") throw new Error("no input given");
    if(newDiscordNick.indexOf("#") === -1) throw new Error("no # in new nick");
    if (!Number.isInteger(Number.parseInt(newDiscordNick.slice(newDiscordNick.length - 4, newDiscordNick.length)))) throw new Error("no discriminator");

    this.data.discord_nick = newDiscordNick;
  }

  getDiscordNick(){
    return this.data.discord_nick;
  }

  getDiscordAvatarUrl() {
    return new Promise((resolve, reject) => {
      discord_api.getAvatarUrl(this.data.discord, (avatarUrl) => {
        resolve(avatarUrl);
      });
    });  
  }

  getDiscordUserdata(){
    return new Promise((resolve, reject) => {
      discord_api.getUserObject({id: this.data.discord}, {fromApi: true}, (err, userObject) => {
        if(err){
          reject(err);
        }else{
          resolve(userObject);
        }
      });
    });
  }

  getKarma(){
    return this.data.karma;
  }

  async modifyKarmaBy(modifier){
    this.data.karma += modifier;
    await this.save();
  }

  getStatus(){
    return this.data.status;
  }

  setStatus(status){
    if (User.isValidStatus(status)){
      this.data.status = status;
    }else{
      throw new Error(`value ${status} is not a valid status`);
    }
  }

  static isValidStatus(status){
    return status >= 0 && status <= 2;
  }
} 

User.schema = {
  discord: {
    type: String,
    index: true,
    unique: true
  },
  discord_nick: String,
  mcName: String,
  mcUUID: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 0
  }, //0 = regular pleb, 1 = whitelisted paxterya member, 2 = inactive paxterya member
  birth_year: Number,
  birth_month: Number,
  country: String,
  publish_age: Boolean,
  publish_country: Boolean,
  karma: {
    type: Number,
    default: 0
  },
  read_cards: Array
};

module.exports = User;