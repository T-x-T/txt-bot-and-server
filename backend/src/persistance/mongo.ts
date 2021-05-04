import mongoose = require("mongoose");
const Schema = mongoose.Schema;
import type {MongooseFilterQuery} from "mongoose";
import type {IPersistanceProvider} from "./IPersistanceProvider";

let connected = false;
let models: {[index: string]: mongoose.Model<any>} = {};

//This is the peristableProvider for saving and getting data to and from a mongoDB Database
class Mongo implements IPersistanceProvider<any>{
  static mongoDbUrl: string;
  collection;
  schema;
  model: mongoose.Model<any>;
  
  //options:
  constructor(collection: string, schema: any){
    this.collection = collection;
    this.schema = schema;
  }

  async connect(){
    if(!connected) {
      await mongoose.connect(Mongo.mongoDbUrl, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
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
    this.schema.pre("save", 
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

  async retrieveFirstFiltered(filter: MongooseFilterQuery<any>){
    return await this.retrieveOneFilteredAndSorted(filter, null);
  }

  async retrieveFiltered(filter: MongooseFilterQuery<any>){
    return await this.retrieveFilteredAndSorted(filter, null);
  }

  async retrieveNewest() {
    return await this.retrieveNewestFiltered({});
  }

  async retrieveNewestFiltered(filter: MongooseFilterQuery<any>){
    return await this.retrieveOneFilteredAndSorted(filter, {_id: -1});
  }

  async retrieveFilteredAndSorted(filter: MongooseFilterQuery<any>, sort: any){
    sort = typeof sort == "object" ? { "sort": sort, lean: true } : null;
    return await this.model.find(filter, null, sort);
  }

  async retrieveOneFilteredAndSorted(filter: MongooseFilterQuery<any>, sort: any) {
    sort = typeof sort == "object" ? { "sort": sort } : null;
    return await this.model.findOne(filter, null, sort);
  }


  /*
   * Save
   */

  async save(input: any){
    let filter: any = false;
    filter = input.hasOwnProperty("_id") ? {_id: input._id} : filter;
    filter = input.hasOwnProperty("discord") ? {discord: input.discord} : filter;
    filter = input.hasOwnProperty("discord_id") ? {discord_id: input.discord_id} : filter;
    filter = input.hasOwnProperty("id") ? {id: input.id} : filter;

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

  async deleteByFilter(filter: MongooseFilterQuery<any>){
    await this.model.deleteMany(filter);
  }
}

export = Mongo;