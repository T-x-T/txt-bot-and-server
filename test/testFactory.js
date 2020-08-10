const Factory = require("../src/persistance/factory.js");
const TestPersistable = require("./testPersitable.js");

class TestFactory extends Factory{
  constructor(options){
    options.schema = TestPersistable.schema;
    super(options);
  }

  create(text, bool){
    return new TestPersistable(text, bool, this.options.persistanceProvider);
  }
}

module.exports = TestFactory;