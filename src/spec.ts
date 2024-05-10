import { KeyOf, PropertyType } from "./generics";
import { IObject } from "./object";
import { Set } from "./sets";

/**
 * A reference record is a record of sets connecting via the @see ReferenceSpecification
 */
export type ReferenceRecord<T extends ReferenceSpecification<T>> = { [P in keyof T]: Set<PropertyType<T, P>> };

/**
 * A reference specification is a record of type to object types
 * @example
 * {
 *  "classes": ClassObject,
 *  "students": StudentObject,
 *  "teachers": TeacherObject,
 * }
 */
export type ReferenceSpecification<T> = Record<KeyOf<T>, IObject>;
