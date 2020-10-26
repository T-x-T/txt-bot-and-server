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
    await mongoose.connect(this.mongodb_url, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    await this._createModel();
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

  async retrieveFirst() {
    return await this.retrieveOneFilteredAndSorted({}, null);
  }

  async retrieveAll(){
    return await this.retrieveFiltered({});
  }

  async retrieveFirstFiltered(filter){
    return await this.retrieveOneFilteredAndSorted(filter, null);
  }

  async retrieveFiltered(filter){
    return await this.retrieveFilteredAndSorted(filter, null);
  }

  async retrieveNewest() {
    return await this.retrieveNewestFiltered({});
  }

  async retrieveNewestFiltered(filter){
    return await this.retrieveOneFilteredAndSorted(filter, {_id: -1});
  }

  async retrieveFilteredAndSorted(filter, sort){
    sort = typeof sort == "object" ? { "sort": sort, lean: true } : null;
    return await this.model.find(filter, null, sort);
  }

  async retrieveOneFilteredAndSorted(filter, sort) {
    sort = typeof sort == "object" ? { "sort": sort } : null;
    return await this.model.findOne(filter, null, sort);
  }


  /*
   * Save
   */

  async save(input){
    let filter = false;
    filter = input.hasOwnProperty('_id') ? {_id: input._id} : filter;
    filter = input.hasOwnProperty('discord') ? {discord: input.discord} : filter;
    filter = input.hasOwnProperty('discord_id') ? {discord_id: input.discord_id} : filter;
    filter = input.hasOwnProperty('id') ? {id: input.id} : filter;

    if(filter) {
      return await this.model.findOneAndUpdate(filter, input, {new: true, useFindAndModify: false, upsert: true});
    } else {
      throw new Error("Unable to find key to filter on");
    }
  }

  async create(input){
    return await new this.model(input).save();
  }

  /*
   * Delete
   */

  async deleteAll(){
    await this.deleteByFilter({});
  }

  async deleteByFilter(filter){
    await this.model.deleteMany(filter);
  }
}

module.exports = Mongo;