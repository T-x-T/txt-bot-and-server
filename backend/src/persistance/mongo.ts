const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let connected = false;
let models: any = {}; //TODO: fix any

//This is the peristableProvider for saving and getting data to and from a mongoDB Database
class Mongo{
  mongodb_url;
  collection;
  schema;
  model: any;
  
  //options:
  //mongodb_url: if not given, use the value from the config
  constructor(collection: string, schema: any, options: any){
    this.collection = collection;
    this.schema = schema;
    this.mongodb_url = global.g.config.data.mongodb_url;
  }

  async connect(){
    if(!connected) {
      await mongoose.connect(this.mongodb_url, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
      connected = true;
    }
    if(models.hasOwnProperty(this.collection)){
      this.model = models[this.collection];
    }else{
      await this._createModel();
    }
  }

  async _createModel(){
    try{
      this.schema = new Schema(this.schema);
      this._applyAutoIncrements();
      this.model = mongoose.model(this.collection, this.schema);
      models[this.collection] = this.model;
    }catch(e){
      this.model = mongoose.models[this.collection];
      if(!this.model) throw new Error(e)
    }
  }

  _applyAutoIncrements() {
    for (let key in this.schema.paths) {
      if (this.schema.paths[key].options.hasOwnProperty("autoIncrement") && this.schema.paths[key].options.autoIncrement) {
        this._autoIncrement(key, this.collection);
      }
    }
  }

  _autoIncrement(key: string, collection: string){
    this.schema.pre('save', 
      function(next: Function) {
        if (this.isNew) {
          models[collection].countDocuments().then((res: number) => {
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

  async retrieveFirstFiltered(filter: any){ //TODO: fix any
    return await this.retrieveOneFilteredAndSorted(filter, null);
  }

  async retrieveFiltered(filter: any){
    return await this.retrieveFilteredAndSorted(filter, null);
  }

  async retrieveNewest() {
    return await this.retrieveNewestFiltered({});
  }

  async retrieveNewestFiltered(filter: any){
    return await this.retrieveOneFilteredAndSorted(filter, {_id: -1});
  }

  async retrieveFilteredAndSorted(filter: any, sort: any){
    sort = typeof sort == "object" ? { "sort": sort, lean: true } : null;
    return await this.model.find(filter, null, sort);
  }

  async retrieveOneFilteredAndSorted(filter: any, sort: any) {
    sort = typeof sort == "object" ? { "sort": sort } : null;
    return await this.model.findOne(filter, null, sort);
  }


  /*
   * Save
   */

  async save(input: any){
    let filter: any = false;
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

  async create(input: any){
    return await new this.model(input).save();
  }

  /*
   * Delete
   */

  async deleteAll(){
    await this.deleteByFilter({});
  }

  async deleteByFilter(filter: any){
    await this.model.deleteMany(filter);
  }
}

module.exports = Mongo;

export type {Mongo};

export default {}