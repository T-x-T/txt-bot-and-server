const Factory = require("../persistance/factory.js");
const Application = require("../application.js");

class ApplicationFactory extends Factory{
  constructor(options) {
    if(typeof options != "object") var options = {};
    options.schema = Application.schema;
    options.name = "applications";
    super(options);
  }

  create(){

  }

  getById(){

  }

  getByDiscordId(){

  }

  getByMcUuid(){

  }

  getFiltered(){
    
  }
}

module.exports = ApplicationFactory;