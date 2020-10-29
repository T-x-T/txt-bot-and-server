//Dependencies
const Persistable = require("../persistance/persistable.js");
const Factory = require("../persistance/factory.js");

//Options for instanciating Persistable/Factory
let dbOptions = {};

let _blog = {};

_blog.create = async function(blog) {
  if(!isValid(blog)) throw new Error("Incorrect Input! title, author and body must be truthy");

  let persistable = new Persistable(dbOptions);
  await persistable.init();

  if(!blog.date) blog.date = new Date();
  persistable.data = blog;

  await persistable.create();
  return persistable.data;
};

_blog.replace = async function(blog) {
  if(!isValid(blog)) throw new Error("Incorrect Input! title, author and body must be truthy");
  if(!blog.hasOwnProperty("id") || typeof blog.id !== "number") throw new Error("blog must contain numerical id to replace");

  let blogFromDb = new Persistable(dbOptions);
  await blogFromDb.init();
  blogFromDb.data = await _blog.getFiltered({id: blog.id});
  
  if(blogFromDb.data.length === 0) throw new Error("no blog with given id found");
  
  if(!blog.date) blog.date = new Date();
  blogFromDb.data = blog;

  await blogFromDb.save();
  return blogFromDb.data;
};

function isValid(blog) {
  return blog.title && blog.author && blog.body;
}

_blog.getAll = async function() {
  return await _blog.getFiltered({});
};

_blog.getPublic = async function() {
  return await _blog.getFiltered({
    $and: [
      {public: true},
      {date: {$lt: new Date()}}
    ]
  });
}

_blog.getFiltered = async function(filter) {
  factory = new Factory(dbOptions);
  await factory.connect();
  return await factory.persistanceProvider.retrieveFiltered(filter);
};

_blog.getNewest = async function() {
  factory = new Factory(dbOptions);
  await factory.connect();
  return await factory.persistanceProvider.retrieveNewest();
};

_blog.schema = {
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
};

dbOptions = {name: "post", schema: _blog.schema};

module.exports = _blog;