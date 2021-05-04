import type {MongooseFilterQuery, SchemaDefinition} from "mongoose";

interface IPersistanceProviderConstructor {
  new(collection: string, schema: any, options?: {[key: string]: string | number | boolean}): IPersistanceProvider<any>,
}

interface IPersistanceProvider<T> {
  collection: string,
  schema: SchemaDefinition,
  options?: {[key: string]: string | number | boolean},
  connect(): Promise<void>,
  retrieveFirst(): Promise<T>,
  retrieveAll(): Promise<T[]>,
  retrieveFirstFiltered(filter: MongooseFilterQuery<any>): Promise<T>,
  retrieveFiltered(filter: MongooseFilterQuery<any>): Promise<T[]>,
  retrieveNewest(): Promise<T>,
  retrieveNewestFiltered(filter: MongooseFilterQuery<any>): Promise<T>,
  retrieveFilteredAndSorted(filter: MongooseFilterQuery<any>, sort: any): Promise<T[]>,
  retrieveOneFilteredAndSorted(filter: MongooseFilterQuery<any>, sort: any): Promise<T>,
  save(input: any): Promise<T>,
  create(input: any): Promise<T>,
  deleteAll(): Promise<void>,
  deleteByFilter(filter: MongooseFilterQuery<any>): Promise<void>
}

export type {IPersistanceProviderConstructor, IPersistanceProvider};