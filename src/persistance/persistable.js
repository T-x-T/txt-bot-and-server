//This is a base clase that needs to be inherited by all classes to implement persistance

class Persistable{
  persistanceProvider;
  options;

  //options:
  //persistanceProvider: "mongo" or "testing", if not set get default from config
  constructor(options){
    this.options = typeof options == "object" ? options : {};

    _initializePersitanceProvider();
  }

  _initializePersitanceProvider(){
    if (this.options.hasOwnProperty("persistanceProvider") && this.options.persistanceProvider == "mongo" || this.options.persistanceProvider == "testing"){
      this.persistanceProvider = new require(`./${this.options.persistanceProvider}.js`)();
    }else{
      this.persistanceProvider = new require(`./${config.data.backend}.js`)();
    }
  }



}

module.exports = Persistable;