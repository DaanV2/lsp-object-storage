import { IObject } from "../src";

describe("IObject", () => {
  const base: IObject = {
    id: "someId",
    reference: "someReference",
  };

  it("should be able to check if a value is an IObject", () => {
    expect(IObject.is(base)).toBeTruthy();
  });

  it("should be able to compare two IObjects", () => {
    const s = { ...base };

    expect(IObject.equals(base, base)).toBeTruthy();
    expect(IObject.equals(base, s)).toBeTruthy();

    const d = {
      ...base,
      temp: "temp",
    };

    expect(IObject.equals(base, d)).toBeTruthy();
  });

  it("should be able to get the id of an IObject", () => {
    expect(IObject.getId(base)).toBe(base.id);
    expect("someId").toBe(base.id);
  });

  it("should be able to get the reference of an IObject", () => {
    expect(IObject.getReference(base)).toBe(base.reference);
    expect("someReference").toBe(base.reference);
  });
});
