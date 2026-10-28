type ObjectDictionary<T> = { [key: string]: T };
type ArrayDictionary<T> = { [key: string]: T[] };
export type Dictionary<T> = T extends []
  ? ArrayDictionary<T[number]>
  : ObjectDictionary<T>;

type StringDictionary = Dictionary<string>; // {[key: string]: string}
type NumberArrayDictionary = Dictionary<number[]>; // {[key: string]: number[]}
type StringOrNumber = Dictionary<string | number>;

// string thi string het, number thi number het
let a: StringOrNumber = {
  foo: '10',
  bar: '10'
}