import EventEmitter from "node:events";

declare global {
  module NodeJS {
    interface Global {
      g: any
    }
  }
}