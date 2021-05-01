//Only use this file to declare types when you cant avoid it

interface IFactoryOptions {
  persistanceProvider?: string,
  schema: any,
  name: string
}

interface IDiscordApiUserObject {
  id: string,
  username: string,
  discriminator: string,  
}

const enum EApplicationStatus {
  pending = 1,
  denied = 2,
  accepted = 3
}

const enum EMemberStatus {
  default,
  active,
  inactive
}