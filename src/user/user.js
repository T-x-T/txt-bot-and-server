const Persistable = require("../persistance/persistable.js");

class User extends Persistable{
  constructor(discord_id, discord_nick, raw_data){
    super({name: "members", schema: User.schema});

    if(raw_data){
      this.data = raw_data;
    }else{
      this.data.discord = discord_id;
      this.data.discord_nick = discord_nick;
    }
  }

  updateDiscord_nick(){

  }

  getDiscordAvatarUrl() {

  }

  getDiscordUserdata(){

  }

  getKarma(){
    return this.data.karma;
  }

  modifyKarmaBy(modifier){
    
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