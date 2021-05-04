import Member = require("./member");

export = (config: IConfig) => {
  Member.config = config;
}