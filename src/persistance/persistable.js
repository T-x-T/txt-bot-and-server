//This is a base clase that needs to be inherited by all classes to implement persistance

class Persistable{
  persistanceProvider;
  options;
  data;

  //options:
  //persistanceProvider: "mongo" or "testing", if not set get default from config
  //name: name for the collection/table in the database
  //schema: object describing the data: https://mongoosejs.com/docs/guide.html
  constructor(options){
    this.options = typeof options == "object" ? options : {};

    this._initializePersitanceProvider();
  }

  _initializePersitanceProvider(){
    if (this.options.hasOwnProperty("persistanceProvider") && this.options.persistanceProvider == "mongo" || this.options.persistanceProvider == "testing"){
      this.persistanceProvider = require(`./${this.options.persistanceProvider}.js`);
    }else{
      this.persistanceProvider = require(`./${config.data.backend}.js`);
    }

    this.persistanceProvider = new this.persistanceProvider(this.options.name, this.options.schema, {});
  }

  init(){
    return new Promise ((resolve, reject) => {
      this.persistanceProvider.connect()
        .then(() => resolve())
        .catch(e => reject(e));
    });
  }

  save(){
    return new Promise((resolve, reject) => {
      this.persistanceProvider.save(this.data)
        .then(() => resolve())
        .catch(e => reject(e));
    });
  }

}

module.exports = Persistable;