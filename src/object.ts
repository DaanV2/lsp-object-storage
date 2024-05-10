export interface IObject {
  /** A unique identifier for this object */
  readonly id: string;
  /** A filepath / uri / other that is used as a reference for this object */
  readonly reference: string;
}

export namespace IObject {
  /**
   * Check if the value is an IObject
   * @param value The value to check
   * @returns True if the value is an IObject
   */
  export function is(value: any): value is IObject {
    return value && typeof value.id === "string" && typeof value.reference === "string";
  }

  /**
   * Check if the value is an array of IObjects
   * @param value The value to check
   * @returns True if the value is an array of IObjects
   */
  export function equals(a: IObject, b: IObject): boolean {
    return a.id === b.id && a.reference === b.reference;
  }

  /**
   * Get the id of an IObject
   * @param value The value to get the id from
   * @returns The id of the value
   */
  export function getId(value: string | Pick<IObject, "id">): string {
    return typeof value === "string" ? value : value.id;
  }

  /**
   * Get the reference of an IObject
   * @param value The value to get the reference from
   * @returns The reference of the value
   */
  export function getReference(value: string | Pick<IObject, "reference">): string {
    return typeof value === "string" ? value : value.reference;
  }
}
