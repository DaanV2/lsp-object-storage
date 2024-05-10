import { Set } from "../src/sets";

interface TestObject {
  id: string;
  reference: string;
  test: string;
}

describe("Set", () => {
  it("should be able to add values", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.add(value);

    expect(set.get("someId")).toEqual([value]);
    expect(set.has("someId")).toBeTruthy();
  });

  it("should be able to set values", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.set("someId", [value]);

    expect(set.get("someId")).toEqual([value]);
    expect(set.has("someId")).toBeTruthy();
  });

  it("if the item doesn't exist, it should return undefined", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    expect(set.get("someOtherId")).toBeUndefined();
  });

  it("If adding a object with a reference that already exists, it should overwrite the existing object", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.add(value);
    expect(set.get("someId")).toEqual([value]);

    const value2: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest2",
    };

    set.add(value2);
    expect(set.get("someId")).toEqual([value2]);
  });

  it("should be able to delete values", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.add(value);
    expect(set.get("someId")).toEqual([value]);

    set.delete("someId");
  });

  it("should be able to delete values using a predicate", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.add(value);
    expect(set.get("someId")).toEqual([value]);

    expect(set.deleteIf((v) => v.id === "someId")).toBeTruthy();
  });

  it("should be able to loop through the values", () => {
    const set = new Set<TestObject>();

    for (let i = 0; i < 10; i++) {
      set.add({
        id: i.toString(),
        reference: i.toString(),
        test: i.toString(),
      });
    }

    let count = 0;
    set.forEach((value) => {
      count++;
    });

    expect(count).toEqual(10);
  });

  it("should be able to filter the values", () => {
    const set = new Set<TestObject>();

    for (let i = 0; i < 10; i++) {
      set.add({
        id: i.toString(),
        reference: i.toString(),
        test: i.toString(),
      });
    }

    const filtered = set.filter((value) => value.id === "5");

    expect(filtered.length).toEqual(1);
  });

  it("should be able to find a value", () => {
    const set = new Set<TestObject>();

    for (let i = 0; i < 10; i++) {
      set.add({
        id: i.toString(),
        reference: i.toString(),
        test: i.toString(),
      });
    }

    const value = set.find((value) => value.id === "5");

    expect(value).toBeTruthy();
  });
});

describe("ReferenceSet", () => {
  it("should be able to get values by reference", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.add(value);
    expect(set.byReference.get("someReference")).toEqual([value]);
  });

  it("should not be able to get a value if the reference is not the same, but the id is", () => {
    const set = new Set<TestObject>();
    const value: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.add(value);
    expect(set.byReference.get("someReference")).toEqual([value]);

    const value2: TestObject = {
      id: "someId",
      reference: "someReference",
      test: "someTest",
    };

    set.add(value2);
    expect(set.byReference.get("someReference")).toEqual([value2]);
    expect(set.byReference.get("someOtherReference")).toEqual([]);
  });

  it("should return all values with the same reference", () => {
    const set = new Set<TestObject>();

    for (let i = 0; i < 10; i++) {
      set.add({
        id: i.toString(),
        reference: "someReference",
        test: i.toString(),
      });
    }

    expect(set.byReference.get("someReference")?.length).toEqual(10);
  });
});
