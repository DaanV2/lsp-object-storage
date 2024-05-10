export interface IObject {
  /** A unique identifier for this object */
  readonly id: string;
  /** A filepath / uri / other that is used as a reference for this object */
  readonly reference: string;
}

export namespace IObject {
  export function is(value: any): value is IObject {
    return value && typeof value.id === "string" && typeof value.reference === "string";
  }

  export function equals(a: IObject, b: IObject): boolean {
    return a.id === b.id && a.reference === b.reference;
  }

  export function getId(value: string | IObject): string {
    return typeof value === "string" ? value : value.id;
  }
}
