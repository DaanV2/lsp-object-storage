/**
 * This PropertyType is used to get the type of a field of an object
 */
export type PropertyType<Object, Property extends keyof Object> = Object[Property];

/**
 * Returns all the property types of an object
 */
export type PropertyTypes<Object> = Object[KeyOf<Object>];

/**
 * Returns the key of an object
 */
export type KeyOf<T> = keyof T;

export type TypePredicate<T> = Predicate<PropertyTypes<T>, KeyOf<T>>;
export type Predicate<V, T> = (value: V, id: string, type: T) => boolean;
export type ForEach<V, T> = (value: V, id: string, type: T) => void;
