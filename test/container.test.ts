import { Container, IObject, Set } from "../src";

interface AObject extends IObject {
  a: string;
}

interface BObject extends IObject {
  b: number;
}

interface CObject extends IObject {
  c: boolean;
}

interface Collection {
  a: AObject;
  b: BObject;
  c: CObject;
}

describe("Container", () => {
  it("should create a new set for each type", () => {
    const col = new Container<Collection>();

    col.add("a", { id: "1", reference: "someReference", a: "a" });
    col.add("b", { id: "2", reference: "someReference", b: 1 });
    col.add("c", { id: "3", reference: "someReference", c: true });

    expect(col.get("a")).toBeDefined();
    expect(col.get("b")).toBeDefined();
    expect(col.get("c")).toBeDefined();

    let count = 0;
    col.forEach((value) => {
      count++;
    });

    expect(count).toEqual(3);
  });

  it("If no id is provided, it should return the whole set", () => {
    const col = new Container<Collection>();

    col.add("a", { id: "1", reference: "someReference", a: "a" });
    col.add("a", { id: "2", reference: "someReference", a: "a" });

    const set = col.get("a");
    expect(set).toBeDefined();
    expect(set).toBeInstanceOf(Set);
  });

  it("If an id is provided, it should return the value with the id", () => {
    const col = new Container<Collection>();

    col.add("a", { id: "1", reference: "someReference", a: "a" });
    col.add("a", { id: "2", reference: "someReference", a: "a" });

    const value = col.get("a", "1");
    expect(value).toBeDefined();
    expect(value).toHaveLength(1);
  });

  it("should be able to delete a value", () => {
    const col = new Container<Collection>();

    col.add("a", { id: "1", reference: "someReference", a: "a" });
    col.add("a", { id: "2", reference: "someReference", a: "a" });

    expect(col.has("a", "1")).toBeTruthy();
    col.delete("a", "1");
    expect(col.has("a", "1")).toBeFalsy();
    expect(col.has("a", "2")).toBeTruthy();
  });

  it("should delete all if only the type is provided", () => {
    const col = new Container<Collection>();

    col.add("a", { id: "1", reference: "someReference", a: "a" });
    col.add("a", { id: "2", reference: "someReference", a: "a" });

    col.delete("a");
    expect(col.has("a", "1")).toBeFalsy();
    expect(col.has("a", "2")).toBeFalsy();
  });

  it("should be able to find a value by a predicate", () => {
    const col = new Container<Collection>();

    col.add("a", { id: "1", reference: "someReference", a: "a" });
    col.add("a", { id: "2", reference: "someReference", a: "a" });

    const value = col.find((value, key, type) => type === "a" && value.id === "1");
    expect(value).toBeDefined();
    expect(value?.id).toEqual("1");
  });

  it("should return undefined if no value is found", () => {
    const col = new Container<Collection>();

    col.add("a", { id: "1", reference: "someReference", a: "a" });
    col.add("a", { id: "2", reference: "someReference", a: "a" });

    const value = col.find((value, key, type) => type === "a" && value.id === "3");
    expect(value).toBeUndefined();
  });
});

describe("ReferenceContainer", () => {
  it("should be able to get values by reference", () => {
    const set = new Container<Collection>();
    const value: CObject = {
      id: "someId",
      reference: "someReference",
      c: true,
    };

    set.add("c", value);
    expect(set.byReference.get("someReference")).toEqual([value]);
  });

  it("should not be able to get a value if the reference is not the same, but the id is", () => {
    const set = new Container<Collection>();
    const value: AObject = {
      id: "someId",
      reference: "someReference",
      a: "someTest",
    };

    set.add("a", value);
    expect(set.byReference.get("someReference")).toEqual([value]);

    const value2: AObject = {
      id: "someId",
      reference: "someReference",
      a: "someTest",
    };

    set.add("a", value2);
    expect(set.byReference.get("someReference")).toEqual([value2]);
    expect(set.byReference.get("someOtherReference")).toEqual([]);
  });

  it("should return all values with the same reference", () => {
    const set = new Container<Collection>();

    for (let i = 0; i < 10; i++) {
      set.add("a", {
        id: i.toString(),
        reference: "someReference",
        a: i.toString(),
      });
    }

    expect(set.byReference.get("someReference")?.length).toEqual(10);
  });

  it("should be able to delete values by reference", () => {
    const set = new Container<Collection>();

    for (let i = 0; i < 10; i++) {
      set.add("a", {
        id: i.toString(),
        reference: "someReference",
        a: i.toString(),
      });
    }

    set.byReference.delete("someReference");
    expect(set.byReference.get("someReference")).toEqual([]);

    for (let i = 0; i < 10; i++) {
      expect(set.has("a", i.toString())).toBeFalsy();
    }
  });

  it("should be able to delete values that start with a specific string", () => {
    const set = new Container<Collection>();

    for (let i = 0; i < 10; i++) {
      set.add("a", {
        id: i.toString(),
        reference: "someReference",
        a: i.toString(),
      });
    }

    set.byReference.deleteStartsWith("some");
    expect(set.byReference.get("someReference")).toEqual([]);

    for (let i = 0; i < 10; i++) {
      expect(set.has("a", i.toString())).toBeFalsy();
    }
  });
});
