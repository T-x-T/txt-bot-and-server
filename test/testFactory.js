require("./test.js");
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

  getById(id){
    return new Promise((resolve, reject) => {
      this.persistanceProvider.retrieveFirstFiltered({ id: id })
        .then(res => resolve(new TestPersistable(res.text, res.bool, this.options.persistanceProvider, id)))
        .catch(e => reject(e));
    });
  }
}

module.exports = TestFactory;