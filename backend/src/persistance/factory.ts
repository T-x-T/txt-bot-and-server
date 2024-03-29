//This is a base clase that needs to be inherited by all classes that implement factories

import type {IPersistanceProviderConstructor, IPersistanceProvider} from "./IPersistanceProvider";

let config: IConfig;
export = class{
  persistanceProvider: IPersistanceProvider<any>;
  options;
  connected = false;

  constructor(options: IFactoryOptions){
    this.options = options;
    this._initializePersitanceProvider();
  }

  static setConfig(_config: IConfig){
    config = _config;
  }

  _initializePersitanceProvider() {
    let persistanceProviderConstructor: IPersistanceProviderConstructor;
    if (this.options.hasOwnProperty("persistanceProvider") && this.options.persistanceProvider == "mongo" || this.options.persistanceProvider == "testing") {
      persistanceProviderConstructor = require(`./${this.options.persistanceProvider}.js`);
    } else {
      persistanceProviderConstructor = require(`./${config.data.backend}.js`);
    }
    this.persistanceProvider = new persistanceProviderConstructor(this.options.name, this.options.schema, {});
  }

  async connect() {
    await this.persistanceProvider.connect();
    this.connected = true;
  }  
}