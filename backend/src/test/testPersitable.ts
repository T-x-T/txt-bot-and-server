require("./test.js");
import Persistable = require("../persistance/persistable.js");

class Test extends Persistable{
  text: string;
  bool: boolean;
  static schema = {
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

  //Id is optional
  constructor(text: string, bool: boolean, persistanceProvider: any, id?: number){
    super({ name: "test", schema: Test.schema, persistanceProvider: persistanceProvider});
    this.data = {
      text: text,
      bool: bool
    }
    
    if(Number.isInteger(id)) this.data.id = id;
  }
}

export = Test;