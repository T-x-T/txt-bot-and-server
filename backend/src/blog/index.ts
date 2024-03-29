//Dependencies
import Persistable = require("../persistance/persistable.js");
import Factory = require("../persistance/factory.js");
import {MongooseFilterQuery} from "mongoose";

interface IBlogPost {
  id?: number
  title: string,
  author: string,
  body: string,
  date?: Date,
  public: boolean
}

const blog = {
  async create(input: IBlogPost) {
    if(!isValid(input)) throw new Error("Incorrect Input! title, author and body must be truthy");

    const persistable = new Persistable(dbOptions);
    await persistable.init();

    if(!input.date) input.date = new Date();
    persistable.data = input;

    await persistable.create();
    return persistable.data;
  },

  async replace(input: IBlogPost ) {
    if(!isValid(input)) throw new Error("Incorrect Input! title, author and body must be truthy");
    if(!input.hasOwnProperty("id") || typeof input.id !== "number") throw new Error("blog must contain numerical id to replace");

    const blogFromDb = new Persistable(dbOptions);
    await blogFromDb.init();
    blogFromDb.data = await blog.getFiltered({id: input.id});

    if(blogFromDb.data.length === 0) throw new Error("no blog with given id found");

    if(!input.date) input.date = new Date();
    blogFromDb.data = input;

    await blogFromDb.save();
    return blogFromDb.data;
  },

  async getAll() {
    return await blog.getFiltered({});
  },

  async getPublic() {
    return await blog.getFiltered({
      $and: [
        {public: true},
        {date: {$lt: new Date()}}
      ]
    });
  },

  async getFiltered(filter: MongooseFilterQuery<any>) {
    const factory = new Factory(dbOptions);
    await factory.connect();
    return await factory.persistanceProvider.retrieveFiltered(filter);
  },

  async getNewest() {
    const factory = new Factory(dbOptions);
    await factory.connect();
    return await factory.persistanceProvider.retrieveNewest();
  },

  schema: {
    id: {
      type: Number,
      index: true,
      unique: true,
      default: 0,
      autoIncrement: true
    },
    title: String,
    author: String,
    body: String,
    date: Date,
    public: Boolean
  }
}

function isValid(input: IBlogPost) {
  return input.title && input.author && input.body;
}

//Options for instanciating Persistable/Factory
const dbOptions = {name: "post", schema: blog.schema};

export = blog;