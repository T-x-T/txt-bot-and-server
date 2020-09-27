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
        let user = new User(discord_id, discord_nick, status, new Date(), 0);
        await user.init();
        await user.save();
        resolve(user);
      }catch(e){
        reject(e);
      }
    });
  }
}

module.exports = UserFactory;