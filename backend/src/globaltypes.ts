//Only use this file to declare types when you cant avoid it

interface IFactoryOptions {
  persistanceProvider?: string,
  schema: any,
  name: string
}

interface IStatsOptions {
  discord_id?: string,
  uuid?: string,
  rank?: string,
  collection?: string
}

const enum EApplicationStatus {
  pending = 1,
  denied = 2,
  accepted = 3
}