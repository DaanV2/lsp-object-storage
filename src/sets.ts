import { IObject } from "./object";

export class Set<V extends IObject> {
  private _data: Map<string, V[]>;

  constructor() {
    this._data = new Map<string, V[]>();
  }

  get byReference(): ReferenceSet<V> {
    return new ReferenceSet(this);
  }

  /**
   * Gets the value of the set
   * @param id The id of the value
   * @returns The value of the set
   */
  get(id: string): V[] | undefined {
    return this._data.get(id);
  }

  /**
   * Sets the value of the set
   * @param id The id of the value
   * @param value The value to set
   * @returns The set
   */
  set(id: string, value: V[]): this {
    this._data.set(id, value);
    return this;
  }

  /**
   * Adds a value to the set
   * @param id The id of the value
   * @param value The value to add
   * @returns This set
   */
  add(value: V): this {
    const values = this._data.get(value.id) || [];

    // Check if the value already exists, if so overwrite it
    const index = values.findIndex((v) => v.reference === value.reference);
    if (index !== -1) {
      values[index] = value;
    } else {
      values.push(value);
      this._data.set(value.id, values);
    }

    return this;
  }

  /**
   * Checks if the set has the value
   * @param id The id of the value
   * @returns True if the value exists, false otherwise
   */
  has(id: string): boolean {
    return this._data.has(id);
  }

  /**
   * Deletes the value from the set
   * @param id The id of the value
   * @returns True if the value was deleted, false otherwise
   */
  delete(id: string): boolean {
    if (typeof id === "string") {
      return this._data.delete(id);
    }

    return this.deleteIf((value) => IObject.equals(value, id)) > 0;
  }

  /**
   * Deletes the values that satisfy the predicate
   * @param predicate The predicate function
   * @returns The number of values deleted
   */
  deleteIf(predicate: (value: V, key: string) => boolean): number {
    let deleted = 0;
    this._data.forEach((values, key) => {
      const newValues = values.filter((value) => !predicate(value, key));
      if (newValues.length !== values.length) {
        this._data.set(key, newValues);
        deleted++;
      }
    });

    return deleted;
  }

  /**
   * Loops through the values and calls the callback function
   * @param callbackfn The callback function
   * @returns void
   */
  forEach(callbackfn: (value: V, key: string) => void): void {
    return this._data.forEach((values, key) => values.forEach((value) => callbackfn(value, key)));
  }

  /**
   * Filter the values based on the predicate
   * @param predicate The predicate function
   * @returns The filtered values
   */
  filter(predicate: (value: V, key: string) => boolean): V[] {
    const result: V[] = [];
    this._data.forEach((values, key) => {
      values.forEach((value) => {
        if (predicate(value, key)) {
          result.push(value);
        }
      });
    });

    return result;
  }

  /**
   * Find the first value that satisfies the predicate
   * @param predicate The predicate function
   * @returns The first value that satisfies the predicate
   */
  find(predicate: (value: V, key: string) => boolean): V | undefined {
    for (const [key, values] of this._data) {
      for (const value of values) {
        if (predicate(value, key)) {
          return value;
        }
      }
    }

    return undefined;
  }
}

/**
 * A wrapper around the Set class that allows for easy reference based access
 */
export class ReferenceSet<V extends IObject> {
  private _data: Set<V>;

  constructor(data: Set<V>) {
    this._data = data;
  }

  /**
   * Adds a value to the set
   * @param value The value to add
   * @returns This set
   */
  get(reference: string): V[] {
    return this._data.filter((value) => value.reference === reference);
  }

  /**
   * Deletes the values with the given reference
   * @param reference The reference to delete
   * @returns The number of values deleted
   */
  delete(reference: string): number {
    return this._data.deleteIf((value) => value.reference === reference);
  }

  /**
   * Deletes all values whose reference starts with the given string
   * @param start The string to check if the reference starts with
   * @returns True if any values were deleted, false otherwise
   */
  deleteStartWith(start: string): number {
    return this._data.deleteIf((value) => value.reference.startsWith(start));
  }
}
