interface User {
  firstName: string,
  lastName: string,
  age?: number
}

/**----------------------------------------MOT SO HAM BUILD-IN------------------------------------- */
// Exclude: Bo 
type SomeDiff = Exclude<'a' | 'b' | 'c', 'c' | 'd'>; // 'a' | 'b'. 'c' da bi removed.
let b: SomeDiff = "a";

// Extract: Giu
type SomeFilter = Extract<'a' | 'b' | 'c', 'c' | 'd'>; // 'c'. 'a' va 'b' da bi removed.
let c: SomeFilter = "c";

// Dung Exclude de tao type alias NonNullable
let d: NonNullable<number | string | undefined | null> = 'null';

// Readonly<T> lam tat ca cac props trong type thanh readonly. Eg: Rat co loi khi dung cho Redux State.
let e: Readonly<User> = {
  firstName: 'Son',
  lastName: 'Nguyen'
}

// Required<T> lam tat ca cac props trong type thanh bat buoc
let f: Required<User> = {
  firstName: 'Son',
  lastName: 'Nguyen',
  age: 20
}

// type Partial<T> lam tat ca cac props trong type thanh optional
let j: Partial<User> = {}

// Pick: Pick tu trong T nhung type co key la K
type PersonWithNames = Pick<User, 'firstName' | 'lastName'>; // {firstName: string, lastName: string}

// Omit: loai bo type co key la K trong T, nguoc lai voi Pick
type PersonWithoutPassword = Omit<User, 'age'>; // {firstName: string, lastName: string}

// Record: Gan type T cho lan luot tung key P trong K
type ThreeStringProps = Record<'prop1' | 'prop2' | 'prop3', string>;

// ReturnType: tra ve type cua gia tri ma function T tra ve.
function sum(a: number, b: number): number {
  return a + b;
}
type Result = ReturnType<typeof sum>; // number

