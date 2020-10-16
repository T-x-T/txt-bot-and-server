const Factory = require("../persistance/factory.js");
const Application = require("./application.js");

class ApplicationFactory extends Factory{
  constructor(options) {
    if(typeof options != "object") var options = {};
    options.schema = Application.schema;
    options.name = "applications";
    super(options);
  }

  //discordUserName and mcIgn are optional
  create(discordId, mcUuid, emailAddress, country, birth_month, birth_year, about_me, motivation, buildImages, publishAboutMe, publishAge, publishCountry, discordUserName, mcIgn){
    return new Promise(async (resolve, reject) => {
      try{
        let application = new Application(null, discordId, mcUuid, emailAddress, country, birth_month, birth_year, about_me, motivation, buildImages, publishAboutMe, publishAge, publishCountry, discordUserName, mcIgn);
        await application.init();
        let raw_result = await application.save();
        application.id = raw_result.id;
        resolve(application);
      }catch(e){
        reject(e);
      }
    });
  }

  getById(){

  }

  getByDiscordId(){

  }

  getByMcUuid(){

  }

  getAcceptedByDiscordId(){

  }

  getFiltered(){
    
  }
}

module.exports = ApplicationFactory;