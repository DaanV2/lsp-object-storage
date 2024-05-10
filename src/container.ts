import { IObject } from "./object";
import { Set } from "./sets";

interface Base {
  a: IObject & { a: string };
  b: IObject & { b: number };
  c: IObject & { c: boolean };
}

/**
 * This PropertyType is used to get the type of a field of an object
 */
export type PropertyType<Object, Property extends keyof Object> = Object[Property];
/**
 * Returns all the property types of an object
 */
export type PropertyTypes<Object> = Object[KeyOf<Object>];
export type KeyOf<T> = keyof T;

export type ReferenceRecord<T extends Record<KeyOf<T>, IObject>> = { [P in keyof T]: Set<PropertyType<T, P>> };

export class Container<T extends Record<KeyOf<T>, IObject>> {
  private _data: Partial<ReferenceRecord<T>>;

  constructor() {
    this._data = {};
  }

  get byReference(): ReferenceContainer<T> {
    return new ReferenceContainer(this);
  }

  private _getSet<U extends KeyOf<T>>(type: U): Set<PropertyType<T, U>> {
    let set = this._data[type];
    if (!set) {
      set = new Set();
      this._data[type] = set;
    }
    return set;
  }

  /**
   * Gets the Underlaying Set for the given type
   * @param type The type to get the set for
   * @returns The set for the given type
   */
  get<U extends KeyOf<T>>(type: U): Set<PropertyType<T, U>>;
  /**
   * Gets the value of the associated id
   * @param type The type to get the value for
   * @param id The id of the value
   */
  get<U extends KeyOf<T>>(type: U, id: string): Array<T[U]>;

  /**
   * Gets the value of the associated id or returns the whole set if no id is provided
   * @param type The type to get the value for
   * @param id The id of the value
   */
  get<U extends KeyOf<T>>(type: U, id?: string): Set<PropertyType<T, U>> | Array<T[U]> | undefined {
    const set = this._getSet(type);

    if (id === undefined) {
      return set;
    }

    return set.get(id);
  }

  /**
   * Adds a value to the set
   * @param type The type to add the value to
   * @param value The value to add
   * @returns This set
   */
  add<U extends KeyOf<T>>(type: U, value: T[U]): this {
    this.get(type).add(value);

    return this;
  }

  /**
   * Checks if the set has the value
   * @param type The type to check for
   * @param id The id of the value
   * @returns True if the value exists, false otherwise
   */
  has(type: KeyOf<T>, id: string): boolean {
    return this.get(type).has(id);
  }

  /**
   * Deletes the entire collection of the given type
   * @param type The type to delete
   */
  delete<U extends KeyOf<T>>(type: U): boolean;
  /**
   * Deletes the value from the set
   * @param type The type to delete the value from
   * @param id The id of the value
   * @returns True if the value was deleted, false otherwise
   */
  delete<U extends KeyOf<T>>(type: U, id: string): boolean;

  /**
   * Deletes the value from the set
   * @param type The type to delete the value from
   * @param id The id of the value
   * @returns True if the value was deleted, false otherwise
   */
  delete<U extends KeyOf<T>>(type: U, id?: string): boolean {
    if (id === undefined) {
      const v = this._data[type] !== undefined;
      delete this._data[type];
      return v;
    }

    return this._getSet(type).delete(id);
  }

  /**
   * Deletes all values whose reference starts with the given string
   * @param start The string to check if the reference starts with
   * @returns True if any values were deleted, false otherwise
   */
  deleteIf(predicate: (value: PropertyTypes<T>, id: string, type: KeyOf<T>) => boolean): void {
    for (const type in this._data) {
      this._data[type]?.deleteIf((value, id) => predicate(value, id, type));
    }
  }

  /**
   * Iterates over all values in the container
   * @param callback The callback function
   */
  forEach(callback: (value: PropertyTypes<T>, id: string, type: KeyOf<T>) => void) {
    for (const type in this._data) {
      this._data[type]?.forEach((value, id) => callback(value, id, type));
    }
  }

  /**
   * Finds a value in the set
   * @param predicate The predicate function
   * @returns The value if found, undefined otherwise
   */
  find(predicate: (value: PropertyTypes<T>, id: string, type: KeyOf<T>) => boolean): IObject | undefined {
    for (const type in this._data) {
      const value = this._getSet(type)?.find((value, id) => predicate(value, id, type));
      if (value) {
        return value;
      }
    }

    return undefined;
  }

  /**
   * Filters the values in the set
   * @param predicate The predicate function
   * @returns The values that satisfy the predicate
   */
  filter(predicate: (value: PropertyTypes<T>, id: string, type: KeyOf<T>) => boolean): IObject[] {
    const result: IObject[] = [];
    for (const type in this._data) {
      const s = this._getSet(type);
      result.push(...s.filter((value, id) => predicate(value, id, type)));
    }

    return result;
  }
}

/**
 * A wrapper around the Container class that allows for easy reference based access
 */
export class ReferenceContainer<T extends Record<KeyOf<T>, IObject>> {
  private _data: Container<T>;

  constructor(data: Container<T>) {
    this._data = data;
  }

  /**
   * Adds a value to the set
   * @param value The value to add
   * @returns This set
   */
  get(reference: string): IObject[] {
    return this._data.filter((value) => value.reference === reference);
  }

  /**
   * Deletes the values with the given reference
   * @param reference The reference to delete
   * @returns The number of values deleted
   */
  delete(reference: string): void {
    this._data.deleteIf((value) => value.reference === reference);
  }

  /**
   * Deletes all values whose reference starts with the given string
   * @param start The string to check if the reference starts with
   * @returns True if any values were deleted, false otherwise
   */
  deleteStartsWith(reference: string): void {
    this._data.deleteIf((value) => value.reference.startsWith(reference));
  }
}
