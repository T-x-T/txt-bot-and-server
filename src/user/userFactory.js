const Factory = require("../persistance/factory.js");
const User = require("./user.js");

class UserFactory extends Factory{
  constructor(options){
    if(typeof options != "object") var options = {};
    options.schema = User.schema;
    options.name = "members";
    super(options);
  }

  async create(discord_id, discord_nick, status){
    return new Promise(async (resolve, reject) => {
      try{
        let user = new User(discord_id, discord_nick, status)
        await user.init();
        await user.save();
        resolve(user);
      }catch(e){
        reject(e);
      }
    });
  }

  async getByDiscordID(discord_id){
    return new Promise((resolve, reject) => {
      if(!discord_id) reject(new Error("No discord_id given"));
      this.persistanceProvider.retrieveFirstFiltered({discord: discord_id})
        .then(async res => {
          let user = new User(res.discord, res.discord_nick, res);
          await user.init();
          resolve(user);
        })
        .catch(e => reject(e));
    });
  }
}

module.exports = UserFactory;