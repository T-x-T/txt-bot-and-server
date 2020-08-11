const Persistable = require("../src/persistance/persistable.js");

const schema = {
  id: {
    type: Number,
    index: true,
    unique: true,
    default: 0,
    autoIncrement: true
  },
  text: String,
  bool: Boolean
};

class Test extends Persistable{
  text;
  bool;
  static schema;

  //Id is optional
  constructor(text, bool, persistanceProvider, id){
    super({ name: "test", schema: schema, persistanceProvider: persistanceProvider});
    this.data = {
      text: text,
      bool: bool
    }
    
    if(Number.isInteger(id)) this.data.id = id;
  }
}

Test.schema = schema;

module.exports = Test;