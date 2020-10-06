//This is a base clase that needs to be inherited by all classes that implement factories

class Factory{
  persistanceProvider;
  options;
  connected = false;

  constructor(options){
    this.options = options;
    this._initializePersitanceProvider();
  }

  _initializePersitanceProvider() {
    if (this.options.hasOwnProperty("persistanceProvider") && this.options.persistanceProvider == "mongo" || this.options.persistanceProvider == "testing") {
      this.persistanceProvider = require(`./${this.options.persistanceProvider}.js`);
    } else {
      this.persistanceProvider = require(`./${config.persistance.backend}.js`);
    }

    this.persistanceProvider = new this.persistanceProvider(this.options.name, this.options.schema, {});
  }

  connect(){
    return new Promise((resolve, reject) => {
      this.persistanceProvider.connect()
        .then(() => {
          this.connected = true;
          resolve();
        })
        .catch(e => reject(e));
    });
  }  
}

module.exports = Factory;