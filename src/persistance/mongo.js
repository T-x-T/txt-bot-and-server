const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//This is sadly neccessary so we can use the model in the pre save hook before the model is compiled, beacuse the function of the pre save hook has its own this binding
let g_model;

//This is the peristableProvider for saving and getting data to and from a mongoDB Database
class Mongo{
  
  mongodb_url;
  collection;
  schema;
  model;
  
  //options:
  //mongodb_url: if not given, use the value from the config
  constructor(collection, schema, options){
    this.collection = collection;
    this.schema = schema;
    this.mongodb_url = typeof options == "object" && options.hasOwnProperty("mongodb_url") ? options.mongodb_url : config.data.mongodb_url;
  }

  async connect(){
    return new Promise(async(resolve, reject) => {
      try{
        await mongoose.connect(this.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        await this._createModel();
        resolve();
      }catch(e) {
        reject(new Error(`Error occured when trying to connect to database: ${e.message}`));
      }
    });
  }

  async _createModel(){
    try{
      this.schema = new Schema(this.schema);
      this._applyAutoIncrements();
      this.model = mongoose.model(this.collection, this.schema);
      g_model = this.model;
    }catch(e){
      this.model = mongoose.models[this.collection];
      if(!this.model) throw new Error(e)
    }
  }

  _applyAutoIncrements() {
    for (let key in this.schema.paths) {
      if (this.schema.paths[key].options.hasOwnProperty("autoIncrement") && this.schema.paths[key].options.autoIncrement) {
        this._autoIncrement(key);
      }
    }
  }

  _autoIncrement(key){
    this.schema.pre('save', 
      function(next) {
        if (this.isNew) {
          g_model.countDocuments().then(res => {
            this[key] = res;
            next();
          });
        } else {
          next();
        }
      }
    );
  }

  /*
   *  Retrieve
   */

  retrieveFirst() {
    return new Promise((resolve, reject) => {
      this.retrieveOneFilteredAndSorted({}, null)
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  retrieveAll(){
    return new Promise((resolve, reject) => {
      this.retrieveFiltered({})
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  retrieveFirstFiltered(filter){
    return new Promise((resolve, reject) => {
      this.retrieveOneFilteredAndSorted(filter, null)
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  retrieveFiltered(filter){
    return new Promise((resolve, reject) => {
      this.retrieveFilteredAndSorted(filter, null)
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  retrieveNewest() {
    return new Promise((resolve, reject) => {
      this.retrieveNewestFiltered({})
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  retrieveNewestFiltered(filter){
    return new Promise((resolve, reject) => {
      this.retrieveOneFilteredAndSorted(filter, { _id: -1 })
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  retrieveFilteredAndSorted(filter, sort){
    sort = typeof sort == "object" ? { "sort": sort, lean: true } : null;
    return new Promise((resolve, reject) => {
      this.model.find(filter, null, sort)
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  retrieveOneFilteredAndSorted(filter, sort) {
    sort = typeof sort == "object" ? { "sort": sort } : null;
    return new Promise((resolve, reject) => {
      this.model.findOne(filter, null, sort)
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }


  /*
   * Save
   */

  save(input){
    return new Promise((resolve, reject) => {
      let filter = false;
      filter = input.hasOwnProperty('_id') ? { _id: input._id } : filter;
      filter = input.hasOwnProperty('discord') ? { discord: input.discord } : filter;
      filter = input.hasOwnProperty('discord_id') ? { discord_id: input.discord_id } : filter;
      filter = input.hasOwnProperty('id') ? { id: input.id } : filter;
      
      if(filter){
        //delete input._id; Needed that in the past, prolly not anymore?
        this.model.findOneAndUpdate(filter, input, { new: true, useFindAndModify: false, upsert: true })
          .then(res => resolve(res))
          .catch(e => reject(e));
      }else{
        reject(new Error("Unable to find key to filter on"));
      }
    });
  }

  create(input){
    return new Promise((resolve, reject) => {
      new this.model(input).save()
        .then(res => resolve(res))
        .catch(e => reject(e));
    });
  }

  /*
   * Delete
   */

  deleteAll(){
    return new Promise((resolve, reject) => {
      this.deleteByFilter({})
        .then(() => resolve())
        .catch((e) => reject(e));
    });
  }

  deleteByFilter(filter){
    return new Promise((resolve, reject) => {
      this.model.deleteMany(filter)
        .then(() => resolve())
        .catch((e) => reject(e));
    });
  }
}

module.exports = Mongo;