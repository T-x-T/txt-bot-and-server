const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//This is the peristableProvider for saving and getting data to and from a mongoDB Database
class Mongo{
  
  mongodb_url;
  
  //options:
  //mongodb_url: if not given, use the value from the config
  constructor(options){
    this.mongodb_url = typeof options == "object" && options.hasOwnProperty("mongodb_url") ? options.mongodb_url : config.data.mongodb_url;
  }

  connect(){
    mongoose.connect(this.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
      .then(console.log('Sucessfully connected to database'));
  }
}

module.exports = Mongo;