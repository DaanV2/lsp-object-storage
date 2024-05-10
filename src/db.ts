import { Container } from "./container";
import { ForEach, KeyOf, Predicate, PropertyType, PropertyTypes, TypePredicate } from "./generics";
import { IObject } from "./object";
import { ReferenceSpecification } from "./spec";
import { Set } from "./sets";

/**
 * A memory database that stores objects by reference
 * @template T The reference specification
 * @example
 * interface DBSpec {
 *   classes: ClassObject;
 *   students: StudentObject;
 *   teachers: TeacherObject;
 * }
 *
 * const db = new Database<DBSpec>();
 */
export class Database<T extends ReferenceSpecification<T>> {
  /** A map of baseRefence and the associated container */
  private _containers: Map<string, Container<T>>;

  constructor() {
    this._containers = new Map<string, Container<T>>();
  }

  /**
   * Returns a wrapper around the database that allows for searching by type
   * @param type The type to search by
   * @returns A wrapper around the database that allows for searching by type
   */
  byType<U extends KeyOf<T>>(type: U): TypeDatabase<T, U> {
    return new TypeDatabase(type, this);
  }

  /**
   * Returns a wrapper around the database that allows for searching by reference
   * @returns A wrapper around the database that allows for searching by reference
   */
  get byReference(): ReferenceDatabase<T> {
    return new ReferenceDatabase(this);
  }

  /**
   * Returns an iterator of all the containers
   * @returns An iterator of all the containers
   */
  containers(): IterableIterator<Container<T>> {
    return this._containers.values();
  }

  /**
   * Creates a new container with the given base reference
   * @param baseReference The base reference for the container
   * @returns The new container
   */
  newContainer(baseReference: string): Container<T> {
    const container = new Container<T>();
    this._containers.set(baseReference, container);
    return container;
  }

  /**
   * Gets the container with the given base reference, or creates a new one if it doesn't exist
   * @param baseReference The base reference for the container
   * @returns The container
   */
  getContainer(baseReference: string): Container<T> {
    let container = this._containers.get(baseReference);
    if (!container) {
      container = new Container();
      this._containers.set(baseReference, container);
    }
    return container;
  }

  /**
   * Finds the first container with the given reference
   * @param baseReference The reference to search for
   * @returns The container with the given reference, or undefined if not found
   */
  findContainer(baseReference: string | IObject): Container<T> | undefined {
    const reference = IObject.getReference(baseReference);

    for (const [base, container] of this._containers) {
      if (reference.startsWith(base)) {
        return container;
      }
    }
  }

  /**
   * Finds all containers with the given reference
   * @param baseReference The reference to search for
   * @returns An array of containers with the given reference
   */
  findContainers(baseReference: string | IObject): Array<Container<T>> {
    const reference = IObject.getReference(baseReference);
    const containers: Array<Container<T>> = [];

    for (const [base, container] of this._containers) {
      if (reference.startsWith(base)) {
        containers.push(container);
      }
    }

    return containers;
  }

  /**
   * Adds an object to the database
   * @param type The type of the object
   * @param object The object to add
   * @returns True if the object was added, false if not
   */
  add<U extends KeyOf<T>>(type: U, object: PropertyType<T, U>): boolean {
    const reference = IObject.getReference(object);
    const container = this.findContainer(reference);
    if (container) {
      container.add(type, object);
      return true;
    }

    return false;
  }

  /**
   * Gets the object with the given id
   * @param predicate The predicate to search for
   * @returns The object with the given id, or undefined if not found
   */
  find(predicate: TypePredicate<T>): PropertyType<T, KeyOf<T>> | undefined {
    for (const container of this._containers.values()) {
      const object = container.find(predicate);
      if (object) {
        return object;
      }
    }

    return undefined;
  }

  /**
   * Iterates over all values in the database
   * @param callback The callback function
   */
  forEach(callback: ForEach<PropertyTypes<T>, KeyOf<T>>): void {
    for (const container of this._containers.values()) {
      container.forEach(callback);
    }
  }

  /**
   * Filters the values in the database
   * @param predicate The predicate function
   * @returns An array of values that match the predicate
   */
  filter(predicate: TypePredicate<T>): Array<PropertyType<T, KeyOf<T>>> {
    const results: Array<PropertyType<T, KeyOf<T>>> = [];

    for (const container of this._containers.values()) {
      const object = container.filter(predicate);
      results.push(...object);
    }

    return results;
  }

  /**
   * Deletes all values that match the predicate
   * @param predicate The predicate function
   * @returns The number of values deleted
   */
  deleteIf(predicate: TypePredicate<T>): number {
    let deleted = 0;

    for (const container of this._containers.values()) {
      deleted ||= container.deleteIf(predicate);
    }

    return deleted;
  }
}

/**
 * A wrapper around the database that allows for searching by type
 */
export class TypeDatabase<T extends ReferenceSpecification<T>, U extends KeyOf<T>> {
  private _database: Database<T>;
  private _type: U;

  constructor(type: U, database: Database<T>) {
    this._database = database;
    this._type = type;
  }
  /**
   * Returns an array of sets containing objects of the specified type
   * @returns An array of sets containing objects of the specified type
   */
  sets(): Array<Set<PropertyType<T, U>>> {
    const sets: Array<Set<PropertyType<T, U>>> = [];
    for (const container of this._database.containers()) {
      const set = container.get(this._type);
      sets.push(set);
    }
    return sets;
  }

  /**
   * Adds an object of the specified type to the database
   * @param object The object to add
   * @returns True if the object was added, false if not
   */
  add(object: PropertyType<T, U>): boolean {
    const ref = this._database.findContainer(object);
    if (ref) {
      ref.add(this._type, object);
      return true;
    }

    return false;
  }

  /**
   * Gets objects of the specified type with the given id
   * @param id The id to search for
   * @returns An array of objects with the given id
   */
  get(id: string): Array<PropertyType<T, U>> {
    const results: Array<PropertyType<T, U>> = [];

    for (const container of this._database.containers()) {
      const objects = container.get(this._type, id);
      if (objects) {
        results.push(...objects);
      }
    }

    return results;
  }

  /**
   * Deletes objects of the specified type with the given id
   * @param id The id to delete
   * @returns True if objects were deleted, false if not
   */
  delete(id: string): boolean {
    let deleted = false;

    for (const container of this._database.containers()) {
      deleted ||= container.delete(this._type, id);
    }

    return deleted;
  }

  /**
   * Finds the first object of the specified type that matches the predicate
   * @param predicate The predicate function
   * @returns The object that matches the predicate, or undefined if not found
   */
  find(predicate: Predicate<PropertyType<T, U>, U>): PropertyType<T, U> | undefined {
    for (const container of this._database.containers()) {
      const object = container.get(this._type).find((value, id) => predicate(value, id, this._type));
      if (object) {
        return object;
      }
    }

    return undefined;
  }

  /**
   * Filters objects of the specified type that match the predicate
   * @param predicate The predicate function
   * @returns An array of objects that match the predicate
   */
  filter(predicate: Predicate<PropertyType<T, U>, U>): Array<PropertyType<T, U>> {
    const results: Array<PropertyType<T, U>> = [];

    for (const container of this._database.containers()) {
      const objects = container.get(this._type).filter((value, id) => predicate(value, id, this._type));
      results.push(...objects);
    }

    return results;
  }

  /**
   * Iterates over all values of the specified type in the database
   * @param callback The callback function
   */
  forEach(callback: ForEach<PropertyType<T, U>, U>): void {
    for (const container of this._database.containers()) {
      const set = container.get(this._type);
      set.forEach((value, id) => callback(value, id, this._type));
    }
  }
}

/**
 * A wrapper around the database that allows for searching by reference
 */
export class ReferenceDatabase<T extends ReferenceSpecification<T>> {
  private _data: Database<T>;

  constructor(database: Database<T>) {
    this._data = database;
  }

  /**
   * Adds a value to the set
   * @param value The value to add
   * @returns This set
   */
  get(reference: string): Array<PropertyTypes<T>> {
    const containers = this._data.findContainers(reference);

    const results: Array<PropertyTypes<T>> = [];
    for (const container of containers) {
      const object = container.byReference.get(reference);
      results.push(...object);
    }

    return results;
  }

  /**
   * Deletes the values with the given reference
   * @param reference The reference to delete
   * @returns The number of values deleted
   */
  delete(reference: string): number {
    let deleted = 0;

    for (const container of this._data.findContainers(reference)) {
      deleted ||= container.byReference.delete(reference);
    }

    return deleted;
  }

  /**
   * Deletes all values whose reference starts with the given string
   * @param start The string to check if the reference starts with
   * @returns The number of values deleted
   */
  deleteStartsWith(reference: string): number {
    let deleted = 0;

    for (const container of this._data.findContainers(reference)) {
      deleted ||= container.byReference.deleteStartsWith(reference);
    }

    return deleted;
  }
}
