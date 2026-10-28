# Generic — Function & Method

> **Generic** (kiểu tổng quát) cho phép viết một hàm/class **một lần** mà dùng được cho **nhiều kiểu dữ liệu khác nhau**, nhưng vẫn giữ nguyên sự an toàn kiểu. Đây là bài mở đầu về Generic trong series — các bài [2_Interface](../2_Interface/app.ts) và [3_Class](../3_Class/app.ts) sẽ mở rộng sang generic trên interface và class.

## 1. Vấn đề: lặp code khi viết cùng 1 hàm cho nhiều type

Không có generic, bạn phải viết một hàm cho mỗi kiểu dữ liệu:

```ts
function getNumberArray(arr: number[]): number[] {
  return new Array<number>().concat(arr);
}

function getStringArray(arr: string[]): string[] {
  return new Array<string>().concat(arr);
}

// type mới xuất hiện? Viết thêm một hàm nữa... 😩
function getBooleanArray(arr: boolean[]): boolean[] {
  return new Array<boolean>().concat(arr);
}
```

Dùng `any` thì khỏi lặp, nhưng **mất hết an toàn kiểu**:

```ts
function getArray(arr: any[]): any[] {
  return new Array<any>().concat(arr);
}

const arr = getArray([1, 2, 3]);
arr.push('hello'); // ❌ không báo lỗi — mất hoàn toàn lợi ích của TS
```

## 2. Generic giải quyết cả hai vấn đề

**Generic — Array Method:**

```ts
function getArray<T>(arr: T[]): T[] {
  return new Array<T>().concat(arr);
}

let numArr = getArray<number>([1, 2, 3]);
console.log(numArr); // [ 1, 2, 3 ]
numArr.push(4, 5, 6);
console.log(numArr); // [ 1, 2, 3, 4, 5, 6 ]

let stringArr = getArray<string>(['1', '2', '3']);
console.log(stringArr); // [ '1', '2', '3' ]
stringArr.push('4', '5', '6');
console.log(stringArr); // [ '1', '2', '3', '4', '5', '6' ]
```

Giải phẫu một generic function:

```ts
function getArray<T>(arr: T[]): T[] {
  //              └─ Type Parameter "T" là một "biến cho kiểu dữ liệu"
  //                  T: kiểu của các phần tử mảng đầu vào
  //                                     T[]: mảng đầu ra cùng kiểu
}
```

- `<T>` khai báo một **Type Parameter** — giống như một tham số, nhưng nhận vào một *type* thay vì một *giá trị*.
- Khi gọi hàm, bạn cung cấp type (`getArray<number>(...)`) — hoặc để **TS tự suy luận (infer)** từ tham số:

```ts
let inferred = getArray([1, 2, 3]); // TS tự suy luận T = number
inferred.push('x'); // ❌ Error: không thể push string vào number[]
```

> **Luôn ưu tiên để TS tự suy luận** — viết `getArray([...])` thay vì `getArray<number>([...])` khi type hiển nhiên. Chỉ khai báo tường minh khi suy luận không đủ (vd: mảng rỗng).

## 3. Multiple Type Variables — nhiều type parameter

Một hàm có thể nhận nhiều type parameter:

```ts
/** Generic - Multiple Type Variables */
function displayInfo<T, U>(name: T, age: U): void {
  console.log(`Name: ${name} - Age: ${age}`);
}
let son = displayInfo<string, number>('Sơn', 23); // Name: Sơn - Age: 23
let trinh = displayInfo<number, string>(23, 'Trinh'); // Name: 23 - Age: Trinh
```

Ví dụ thực tế hơn — `merge` và `swap`:

```ts
function merge<A, B>(a: A, b: B): A & B {
  return { ...a, ...b };
}

const user = merge({ name: 'Sơn' }, { age: 23 });
// type: { name: string } & { age: number }
console.log(user.name, user.age); // gợi ý đủ cả 2 properties

function swap<T, U>(pair: [T, U]): [U, T] {
  return [pair[1], pair[0]];
}

const swapped = swap([1, 'one']); // [string, number]
```

> Lưu ý ví dụ `trinh` ở trên: cú pháp hợp lệ (`T` = number, `U` = string), nhưng về **ngữ nghĩa** thì `name` nhận `23` là sai nghĩa — type parameter không "hiểu" tham số nên làm gì. Muốn ràng buộc, hãy dùng **Generic Constraints** ở phần 5.

## 4. Sử dụng generic ngoài việc tái sử dụng

> Sử dụng generic ngoài việc có thể tái sử dụng cho các function có tác vụ giống nhau, còn có lợi ích vì nó sẽ có cùng một data structure. Ví dụ như func generic ra một mảng number và chúng ta muốn loop qua nó bằng `forEach`, thì bên trong vòng lặp sẽ biết và gợi ý các properties/method cho từng phần tử.

```ts
const nums = getArray([1, 2, 3]);
nums.forEach((n) => {
  // n có type là number → gợi ý toFixed(), toExponential()...
  console.log(n.toFixed(2));
});

const users = getArray([{ name: 'Sơn' }, { name: 'Trinh' }]);
users.forEach((u) => {
  // u có type là { name: string } → gợi ý u.name
  console.log(u.name.toUpperCase());
});
```

Đây là sự khác biệt cốt lõi so với `any`: generic **giữ nguyên thông tin kiểu** qua mọi vòng đời của giá trị.

## 5. Generic Constraints — ràng buộc type bằng `extends`

Mặc định, bên trong hàm bạn chỉ làm được những gì mà **mọi type đều có** (`===`, spread...). Muốn truy cập property cụ thể, phải ràng buộc `T` bằng `extends`:

```ts
// ❌ Error: Property 'length' does not exist on type 'T'
function logLength<T>(item: T) {
  console.log(item.length);
}

// ✅ Ràng buộc: T phải có property length (string, array...)
function logLength<T extends { length: number }>(item: T) {
  console.log(item.length);
}

logLength('hello'); // 5
logLength([1, 2, 3]); // 3
// logLength(123); // ❌ Error: number không có length
```

Constraint kinh điển — key phải thuộc object (`keyof`):

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Sơn', age: 23 };

getProperty(user, 'name'); // type: string
getProperty(user, 'age'); // type: number
// getProperty(user, 'email'); // ❌ Error: '"email"' không thuộc keyof user
```

`T[K]` gọi là **indexed access type** — type của property `K` trong `T`. Đây là nền tảng của rất nhiều utility types ([12_Utility-Types](../../3_data-type/12_Utility-Types/README.md)).

## 6. Default Type Parameter — type mặc định

Giống tham số thường, type parameter có thể có giá trị mặc định:

```ts
interface ApiResponse<T = unknown> {
  code: number;
  data: T;
}

// Không truyền type → dùng unknown
const raw: ApiResponse = { code: 200, data: { anything: true } };

// Truyền type cụ thể
const typed: ApiResponse<{ id: number }> = {
  code: 200,
  data: { id: 1 },
};
```

## 7. Ví dụ tổng hợp — viết lại `Array.prototype` style

Kết hợp mọi thứ ở trên: generic + constraint + suy luận:

```ts
function uniqueBy<T>(items: T[], key: keyof T): T[] {
  const seen = new Set<T[keyof T]>();
  return items.filter((item) => {
    if (seen.has(item[key])) return false;
    seen.add(item[key]);
    return true;
  });
}

const courses = [
  { id: 1, name: 'TS Cơ bản' },
  { id: 2, name: 'TS Nâng cao' },
  { id: 3, name: 'TS Cơ bản' },
];

uniqueBy(courses, 'name'); // [ { id: 1, ... }, { id: 2, ... } ]
// uniqueBy(courses, 'slug'); // ❌ Error: 'slug' không thuộc keyof { id, name }
```

Trong ví dụ trên, `key: keyof T` đảm bảo **bạn không thể gõ sai tên property**, còn TS biết chính xác type của giá trị so sánh — điều mà `any` hoặc 2 hàm riêng lẻ không cho bạn.

## 10. Khi nào nên dùng Generic?

| Tình huống | Dùng generic? |
|---|---|
| Hàm hoạt động với nhiều type nhưng logic giống nhau | ✅ |
| Cần **giữ nguyên type** của input ở output (identity, map, filter, groupBy...) | ✅ |
| Hàm chỉ dùng 1 type duy nhất | ❌ Dùng type cụ thể |
| Cần "đầy đủ, nhưng không quan tâm type" | ⚠️ Cân nhắc `unknown` thay vì `any`, hoặc generic không ràng buộc |
| Type phức tạp làm code khó đọc | ⚠️ Đặt tên có nghĩa: `<TItem>`, `<TResponse>` thay vì `<T>` lồng nhau |

> Quy ước đặt tên: `T` (Type), `K` (Key), `V` (Value), `E` (Element), `R` (Return). Với hàm phức tạp, tên dài có nghĩa (`<TModel>`, `<TError>`) đọc dễ hơn nhiều.

## 9. Generic với tham số không xác định — `unknown` và mảng rỗng

Hai tình huống thực tế khi gọi hàm generic:

```ts
// Mảng rỗng — TS không suy luận được gì, mặc định thành never[]
const empty = getArray([]); // never[]
const fixed = getArray<string>([]); // khai báo tường minh khi cần

// Generic với callback
function mapArray<T, U>(items: T[], fn: (item: T, index: number) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < items.length; i++) {
    result.push(fn(items[i], i)); // T và U giữ liên kết với nhau qua fn
  }
  return result;
}

const lengths = mapArray(['a', 'bb', 'ccc'], (s) => s.length); // number[]
// Nếu đổi callback trả về boolean, type kết quả tự đổi thành boolean[] — không cần sửa hàm
```

Điểm mấu chốt: type parameter **kết nối các type với nhau** trong cùng một hàm. `mapArray` ở trên bảo đảm: đổi kiểu trả về của callback, kiểu của `result` và của biến nhận kết quả sẽ **tự động thay đổi theo** — bạn không phải khai báo lại gì cả.

## 9. Bài tập

1. Viết `pluck<T, K extends keyof T>(items: T[], key: K): T[K][]` — lấy ra mảng giá trị của một property từ mảng object.
2. Viết `firstOrDefault<T>(arr: T[], fallback: T): T` — trả về phần tử đầu tiên hoặc giá trị mặc định nếu mảng rỗng. Kiểm tra TS gợi ý đúng type.
3. Viết `pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>` — gợi ý: kết quả trả về dùng utility type `Pick`.

## 📚 Tài liệu tham khảo

- TypeScript Handbook — Generics: https://www.typescriptlang.org/docs/handbook/2/generics.html
- Generics với Interface/Class: https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-interfaces
- Bài tiếp theo trong series: [2_Interface](../2_Interface/app.ts) • [3_Class](../3_Class/app.ts)
