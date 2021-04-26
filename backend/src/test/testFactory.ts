require("./test.js");
const Factory = require("../persistance/factory.js");
const TestPersistable = require("./testPersitable.js");

class TestFactory extends Factory{
  constructor(options: any){
    options.schema = TestPersistable.schema;
    super(options);
  }

  create(text: string, bool: boolean){
    return new TestPersistable(text, bool, this.options.persistanceProvider);
  }

  getById(id: number){
    return new Promise((resolve, reject) => {
      this.persistanceProvider.retrieveFirstFiltered({ id: id })
        .then((res: any) => resolve(new TestPersistable(res.text, res.bool, this.options.persistanceProvider, id)))
        .catch((e: Error) => reject(e));
    });
  }
}

module.exports = TestFactory;

export default {}