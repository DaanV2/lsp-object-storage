import path from "path";
import { Database, IObject, KeyOf } from "../src";

const seedrandom = require("seedrandom");
type Rng = () => number;
const rng = seedrandom("some.random.string.to.act.as.a.seed") as Rng;

// This is a fuzz test file

interface DataPoint extends IObject {
  data: string;
  type: KeyOf<DBSpec>;
}

interface DBSpec {
  classes: DataPoint;
  structs: DataPoint;
  enums: DataPoint;
  unions: DataPoint;
  functions: DataPoint;
  variables: DataPoint;
  namespaces: DataPoint;
  files: DataPoint;
  modules: DataPoint;
  projects: DataPoint;
}

const types: Array<KeyOf<DBSpec>> = [
  "classes",
  "structs",
  "enums",
  "unions",
  "functions",
  "variables",
  "namespaces",
  "files",
  "modules",
  "projects",
];

const baseReferences = ["reference1", "reference2", "reference3", "reference4", "reference5"];

const paths = ["path1", "path2", "path3", "path4", "path5", "items1", "items2", "items3", "items4", "items5"];

describe("Fuzz", () => {
  const database = new Database<DBSpec>();
  baseReferences.forEach((baseReference) => database.newContainer(baseReference));

  const data = Array.from({ length: 1000 }, () => createDataPoint(rng));

  it("Can insert data", () => {
    data.forEach((d) => {
      expect(database.add(d.type, d)).toBeTruthy();
    });
  });

  it("Can find data", () => {
    data.forEach((d) => {
      const result = database.find((x) => x === d);
      expect(result).toEqual(d);
    });
  });

  it("Can get data by type", () => {
    data.forEach((d) => {
      const result = database.byType(d.type).get(d.id);
      expect(result).toContain(d);
    });
  });

  it("Can get find by type", () => {
    data.forEach((d) => {
      const result = database.byType(d.type).find((x) => x === d);
      expect(result).toEqual(d);
    });
  });

  it("Can filter by type", () => {
    types.forEach((t) => {
      const result = database.filter((v, id, type) => type === t);

      const expected = result.filter((x) => x.type === t);
      expect(result).toEqual(expected);
    });
  });
});

function createDataPoint(rng: Rng): DataPoint {
  const type = types[Math.floor(rng() * types.length)];

  return {
    id: randomId(rng),
    reference: createReference(rng),
    data: randomData(rng),
    type,
  };
}

function createReference(rng: Rng): string {
  const i = Math.floor(rng() * baseReferences.length);
  const j = Math.floor(rng() * paths.length);
  const k = Math.floor(rng() * paths.length);
  return path.join(baseReferences[i], paths[j], paths[k]);
}

function randomId(rng: Rng): string {
  return `id_${Math.floor(rng() * 1000)}`;
}

function randomData(rng: Rng): string {
  return `data_${Math.floor(rng() * 1000)}`;
}
