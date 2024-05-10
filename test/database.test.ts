import { Database, IObject } from "../src";

interface DBSpec {
  test: IObject;
  type: IObject;
  classes: IObject;
}

describe("Database", () => {
  it("should create a new container", () => {
    const database = new Database<DBSpec>();
    const container = database.newContainer("reference");

    expect(container).toBeDefined();
    expect(database.containers()).toContain(container);
  });

  it("should get an existing container", () => {
    const database = new Database<DBSpec>();

    const container = database.newContainer("reference");
    const retrievedContainer = database.getContainer("reference");

    expect(retrievedContainer).toBe(container);
  });

  it("should create a new container if it doesn't exist", () => {
    const database = new Database<DBSpec>();

    const retrievedContainer = database.getContainer("reference");

    expect(retrievedContainer).toBeDefined();
    expect(database.containers()).toContain(retrievedContainer);
  });

  it("should find the first container with the given reference", () => {
    const database = new Database<DBSpec>();

    const container = database.newContainer("reference");
    const foundContainer = database.findContainer("reference");

    expect(foundContainer).toBe(container);
  });

  it("should find all containers with the given reference", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference/item1");
    database.newContainer("reference/item2");
    const foundContainers = database.findContainers("reference/item1/data.json");
    expect(foundContainers.length).toBe(1);
  });

  it("should add an object to the database", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");

    const type = "type";
    const object = { id: "1", reference: "reference/item1" };

    const added = database.add(type, object);

    expect(added).toBe(true);
    expect(database.byType(type).get("1")).toEqual([object]);
  });

  it("should not add an object to the database if container doesn't exist", () => {
    const database = new Database<DBSpec>();

    const type = "type";
    const object = { id: "1", reference: "reference/item1" };

    const added = database.add(type, object);

    expect(added).toBe(false);
    expect(database.byType(type).get("1")).toEqual([]);
  });

  it("should find the object with the given id", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");

    const type = "type";
    const object = { id: "1", reference: "reference/item1" };
    database.add(type, object);

    const foundObject = database.find((value) => value.id === "1");

    expect(foundObject).toBe(object);
  });

  it("should iterate over all values in the database", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");

    const type = "type";
    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add(type, object1);
    database.add(type, object2);

    const callback = jest.fn();
    database.forEach(callback);

    expect(callback).toHaveBeenCalledWith(object1, object1.id, type);
    expect(callback).toHaveBeenCalledWith(object2, object2.id, type);
  });

  it("should filter the values in the database", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");

    const type = "type";
    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add(type, object1);
    database.add(type, object2);

    const filteredObjects = database.filter((value) => value.id === "1");

    expect(filteredObjects).toContain(object1);
    expect(filteredObjects).not.toContain(object2);
  });

  it("should delete all values that match the predicate", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");

    const type = "type";
    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add(type, object1);
    database.add(type, object2);

    const deletedCount = database.deleteIf((value) => value.id === "1");

    expect(deletedCount).toBe(1);
  });
});

describe("TypeDatabase", () => {
  it("should return an array of sets containing objects of the specified type", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference/item1");
    database.newContainer("reference/item2");
    const typeDatabase = database.byType("type");

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add("type", object1);
    database.add("type", object2);

    const sets = typeDatabase.sets();
    expect(sets.length).toBe(2);
  });

  it("should add an object of the specified type to the database", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const typeDatabase = database.byType("type");

    const object = { id: "1", reference: "reference/item1" };

    const added = typeDatabase.add(object);

    expect(added).toBe(true);
  });

  it("should get objects of the specified type with the given id", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const typeDatabase = database.byType("type");

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add("type", object1);
    database.add("type", object2);

    const objects = typeDatabase.get("1");

    expect(objects).toContainEqual(expect.objectContaining({ id: "1" }));
    expect(objects).not.toContainEqual(expect.objectContaining({ id: "2" }));
  });

  it("should delete objects of the specified type with the given id", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const typeDatabase = database.byType("type");

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add("type", object1);
    database.add("type", object2);

    const deleted = typeDatabase.delete("1");

    expect(deleted).toBe(true);
  });

  it("should find the first object of the specified type that matches the predicate", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const typeDatabase = database.byType("type");

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add("type", object1);
    database.add("type", object2);

    const foundObject = typeDatabase.find((value) => value.id === "1");

    expect(foundObject).toBe(object1);
  });

  it("should filter objects of the specified type that match the predicate", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const typeDatabase = database.byType("type");

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add("type", object1);
    database.add("type", object2);

    const filteredObjects = typeDatabase.filter((value) => value.id === "1");

    expect(filteredObjects).toContainEqual(expect.objectContaining({ id: "1" }));
    expect(filteredObjects).not.toContainEqual(expect.objectContaining({ id: "2" }));
  });

  it("should iterate over all values of the specified type in the database", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const typeDatabase = database.byType("type");

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add("type", object1);
    database.add("type", object2);

    const callback = jest.fn();
    typeDatabase.forEach(callback);

    expect(callback).toHaveBeenCalledWith(object1, object1.id, "type");
    expect(callback).toHaveBeenCalledWith(object2, object2.id, "type");
  });
});

describe("ReferenceDatabase", () => {
  it("should get values with the given reference", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const referenceDatabase = database.byReference;

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    database.add("type", object1);
    database.add("type", object2);

    const values = referenceDatabase.get("reference/item1");

    expect(values).toEqual([object1]);
  });

  it("should delete values with the given reference", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const referenceDatabase = database.byReference;

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    expect(database.add("type", object1)).toBeTruthy();
    expect(database.add("type", object2)).toBeTruthy();

    const deleted = referenceDatabase.delete("reference/item1");
    expect(deleted).toBe(1);
  });

  it("should delete all values whose reference starts with the given string", () => {
    const database = new Database<DBSpec>();
    database.newContainer("reference");
    const referenceDatabase = database.byReference;

    const object1 = { id: "1", reference: "reference/item1" };
    const object2 = { id: "2", reference: "reference/item2" };
    expect(database.add("type", object1)).toBeTruthy();
    expect(database.add("type", object2)).toBeTruthy();

    const deleted = referenceDatabase.deleteStartsWith("reference");

    expect(deleted).toBe(2);
  });
});
