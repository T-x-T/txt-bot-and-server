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

  constructor(text, bool, persistanceProvider){
    super({ name: "test", schema: schema, persistanceProvider: persistanceProvider});
    this.data = {
      text: text,
      bool: bool
    }
  }
}

module.exports = Test;