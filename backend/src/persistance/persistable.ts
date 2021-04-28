//This is a base clase that needs to be inherited by all classes that implement persistance

import type {IPersistanceProviderConstructor, IPersistanceProvider} from "./IPersistanceProvider";

export = class Persistable{
  persistanceProvider: IPersistanceProvider<any>;
  options: any;
  data: any = {};

  //options:
  //persistanceProvider: "mongo" or "testing", if not set get default from config
  //name: name for the collection/table in the database
  //schema: object describing the data: https://mongoosejs.com/docs/guide.html
  constructor(options: any){
    this.options = typeof options == "object" ? options : {};

    this._initializePersitanceProvider();
  }

  _initializePersitanceProvider(){
    let persistanceProviderConstructor: IPersistanceProviderConstructor;
    if (this.options.hasOwnProperty("persistanceProvider") && this.options.persistanceProvider == "mongo" || this.options.persistanceProvider == "testing"){
      persistanceProviderConstructor = require(`./${this.options.persistanceProvider}.js`);
    }else{
      persistanceProviderConstructor = require(`./${global.g.config.persistance.backend}.js`);
    }

    this.persistanceProvider = new persistanceProviderConstructor(this.options.name, this.options.schema, {});
  }

  async init(){
    await this.persistanceProvider.connect();
  }

  async save(){
    return await this.persistanceProvider.save(this.data);
  }

  async create(){
    return await this.persistanceProvider.create(this.data);
  }
}