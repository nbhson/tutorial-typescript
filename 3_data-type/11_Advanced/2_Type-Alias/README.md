# Type Alias và Conditional Type

## 1. Type Alias — đặt tên cho type

`type` cho phép bạn tạo một **biểu danh (alias)** — một cái tên mới cho một type bất kỳ, không chỉ giới hạn ở object như `interface`:

```typescript
type UserId = string;
type Point = { x: number; y: number };
type Handler = (event: string) => void;
type Status = 'active' | 'inactive' | 'banned';
```

Kế tiếp, chúng ta sẽ tìm hiểu 1 ví dụ về `Type Alias` và `Conditional Type` nhé.

```typescript
type ObjectDictionary<T> = { [key: string]: T };
type ArrayDictionary<T> = { [key: string]: T[] };
export type Dictionary<T> = T extends []
  ? ArrayDictionary<T[number]>
  : ObjectDictionary<T>;

type StringDictionary = Dictionary<string>; // {[key: string]: string}
type NumberArrayDictionary = Dictionary<number[]>; // {[key: string]: number[]}
type UserEntity = Dictionary<User>; // {[key: string]: User}
```

Ở ví dụ trên, chúng ta có 3 `Type Alias`: `ObjectDictionary`, `ArrayDictionary`, và `Dictionary`. Trong đó, `Dictionary` có thể được xem là **True Type** (type được `export` ra cho bên ngoài sử dụng), còn `ObjectDictionary` và `ArrayDictionary` có thể được xem là **Support Type** (type dùng để hỗ trợ cho **True Type**). Và code thì khá dễ hiểu, nếu mình truyền vào 1 type dạng `number[]` cho `type parameter T` ở `Dictionary<T>` thì `T extends []` sẽ được đánh giá (evaluate) là `truthy` và `Dictionary<number[]>` sẽ trả về type `ArrayDictionary<number>`.

> Cú pháp `[key: string]: T` gọi là **Index Signature** — nghĩa là "object này nhận bất kỳ key nào dạng string, giá trị có type T".

## 2. Conditional Type — type có điều kiện

`Conditional Type` có dạng `A extends B ? X : Y`, hoạt động giống **toán tử 3 ngôi** nhưng ở **cấp độ type**:

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<42>; // false
type C = IsString<string | number>; // string extends string? → true (phân phối — xem phần 3)
```

Một số ví dụ hay gặp:

```typescript
// Chỉ cho phép hàm
type OnlyFunctions<T> = T extends (...args: any[]) => any ? T : never;

// Lấy phần tử trong mảng
type ElementType<T> = T extends (infer E)[] ? E : never; // xem 13_Mapped-Types

// Phân biệt mảng và object
type Flatten<T> = T extends any[] ? T[number] : T;

type T1 = Flatten<string[]>; // string
type T2 = Flatten<string>; // string
```

## 3. Distributive Conditional Type — "phân phối" trên union

Khi `Conditional Type` nhận vào một **union**, nó sẽ **tự động áp dụng cho từng thành phần** rồi gộp kết quả lại:

```typescript
type ToArray<T> = T extends any ? T[] : never;

type T1 = ToArray<string | number>; // string[] | number[] (KHÔNG phải (string | number)[])
```

Đây chính là cơ chế giúp `Exclude`/`Extract` hoạt động. Muốn tắt phân phối, bọc type trong cặp ngoặc vuông:

```typescript
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type T2 = ToArrayNonDist<string | number>; // (string | number)[]
```

## 4. Built-in Utility Types

Với `Type Alias` và `Conditional Type`, **TS** ngoài việc cung cấp cho chúng ta khả năng tạo những dạng type thú vị như trên và kết hợp chúng lại với nhau, thì **TS** còn cung cấp cho chúng ta 1 số _built-in_ type rất hay. (Xem đầy đủ hơn ở [12_Utility-Types](../../12_Utility-Types/README.md).) Chúng ta cùng điểm qua một số _built-in_ types hay dùng nhé:

- `Exclude`
- `Extract`
- `Readonly`
- `Partial`
- `Nullable`
- `Pick`
- `Record`
- `ReturnType`
- `Omit` (Omit là `Type Alias` của `Pick` và `Exclude`)

```typescript
// Exclude/Extract
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

// Exclude: Loại bỏ những types ở T nếu như những types này gán được cho U
type SomeDiff = Exclude<'a' | 'b' | 'c', 'c' | 'd'>; // 'a' | 'b'. 'c' đã bị removed.

// Extract: Loại bỏ những types ở T nếu như những types này KHÔNG gán được cho U
type SomeFilter = Extract<'a' | 'b' | 'c', 'c' | 'd'>; // 'c'. 'a' và 'b' đã bị removed.

// hoặc có thể dùng Exclude để tạo type alias NonNullable
type NonNullable<T> = Exclude<T, null | undefined>; // loại bỏ null và undefined từ T

type Readonly<T> = { readonly [P in keyof T]: T[P] }; // làm tất cả các props trong type thành readonly. Eg: Rất có lợi khi dùng cho Redux State.
type Partial<T> = { [P in keyof T]?: T[P] }; // làm tất cả các props trong type thành optional. Eg: Rất có lợi cho việc type 1 tham số khi cần truyền vào 1 type nào đó mà ko bắt buộc.
type Nullable<T> = { [P in keyof T]: T[P] | null }; // cái này tương tự như Partial, Partial sẽ trả về T[P] | undefined. Còn Nullable sẽ trả về T[P] | null

type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Record<K extends keyof any, T> = { [P in K]: T };

// Pick: Pick từ trong T những type có key là K
type Person = {
  firstName: string;
  lastName: string;
  password: string;
};

type PersonWithNames = Pick<Person, 'firstName' | 'lastName'>; // {firstName: string, lastName: string}

// Record: Gán type T cho lần lượt từng key P trong K
type ThreeStringProps = Record<'prop1' | 'prop2' | 'prop3', string>;
// { prop1: string, prop2: string, prop3: string }

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// ReturnType: trả về type của giá trị mà function T trả về.
type Result = ReturnType<() => string>; // string

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Omit: loại bỏ type có key là K trong T
type PersonWithoutPassword = Omit<Person, 'password'>; // {firstName: string, lastName: string}
```

> Bản chất của các utility types trên đều xoay quanh **Mapped Types** — nếu bạn thấy cú pháp `{ [P in keyof T]: ... }` lạ, hãy đọc bài [13_Mapped-Types](../../13_Mapped-Types/README.md).

## 5. `infer` — suy luận type trong conditional type

`infer` cho phép "bắt" một type ẩn bên trong điều kiện:

```typescript
// Lấy type trả về của hàm (chính là cách ReturnType hoạt động)
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Lấy type của Promise
type Unpacked<T> = T extends Promise<infer V> ? V : T;

type A = Unpacked<Promise<string>>; // string
type B = MyReturnType<() => number[]>; // number[]

// Lấy tham số đầu tiên của hàm
type FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type C = FirstArg<(name: string, age: number) => void>; // string
```

## 6. Type Alias vs Interface — khi nào dùng cái nào?

| Tiêu chí | `type` | `interface` |
|---|---|---|
| Object type | ✅ | ✅ |
| Primitive, union, tuple, function type | ✅ (`type ID = string \| number`) | ❌ |
| Mở rộng (`extends`) | Qua `&` | ✅ `extends` |
| Declaration merging (tự gộp 2 khai báo cùng tên) | ❌ | ✅ |
| Mapped/Conditional type | ✅ | ❌ |

```typescript
// type gộp được nhiều dạng
type Config = {
  host: string;
  port: number;
} & { retries?: number }; // intersection

// interface tự động gộp khi khai báo trùng tên (declaration merging)
interface Window {
  title: string;
}
interface Window {
  tsVersion: string;
}
// Window giờ có cả title và tsVersion — dùng khi mở rộng type của thư viện bên ngoài
```

> `Interface` và `Type` trong nhiều trường hợp có thể sử dụng qua lại được. Tuy nhiên, các bạn nên chọn 1 trong 2 và giữ chuẩn này trong toàn bộ dự án của mình. Bài [9_interface](../../../9_interface/app.ts) và [4_type-interface](../../../4_type-interface/app.ts) có ví dụ cụ thể hơn về interface.

## 7. Recursive Type Alias — type đệ quy

Type Alias có thể tham chiếu tới chính nó — hữu ích cho cấu trúc dạng cây/JSON:

```typescript
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type TreeNode = {
  value: string;
  children?: TreeNode[];
};

const tree: TreeNode = {
  value: 'root',
  children: [
    { value: 'child-1' },
    { value: 'child-2', children: [{ value: 'grandchild' }] },
  ],
};
```

Từ TS 5.0+ trở đi, type đệ quy còn mạnh hơn với `const` type parameters và template literal types:

```typescript
// Lấy tên route từ path literal
type ExtractParam<T extends string> = T extends `${string}:${infer P}/${infer Rest}`
  ? P | ExtractParam<`/${Rest}`>
  : T extends `${string}:${infer P}`
    ? P
    : never;

type Params = ExtractParam<'/users/:userId/posts/:postId'>; // 'userId' | 'posts'... (dạng literal)
```

## 8. Mẹo debug type

Khi làm việc với type phức tạp, đừng đoán — hãy nhìn thấy type thật:

```typescript
type Debug<T> = T; // hover để xem kết quả

// Hoặc ép lỗi để TS "in" type ra message:
type Assert<T, U extends T> = T;

// Với TS 4.9+: dùng satisfies để kiểm tra mà giữ nguyên literal type
type Routes = '/' | '/about' | '/contact';
const r = '/about' satisfies Routes;
```

Mẹo hay dùng: đưa type vào object rồi hover, hoặc dùng `// @ts-expect-error` để "test" type.

## 9. Điều kiện cần nhớ về Type Alias

Vài quy tắc mà người mới hay bất ngờ:

- **Type Alias không tồn tại ở runtime.** Toàn bộ `type`, `interface`, conditional type... bị xóa bỏ sau khi compile — type chỉ sống trong quá trình phát triển (xem lại file `app.js` sau khi compile để tự kiểm chứng).
- **Không thể "re-open" type alias.** Khai báo 2 `type User` trong cùng scope sẽ báo lỗi "Duplicate identifier" — khác với `interface` có declaration merging.
- **Type Alias có thể tham chiếu chính nó (đệ quy)** — interface cũng vậy, nhưng type alias đệ quy chỉ giới hạn ở các vị trí nhất định (property, array element).
- **Thứ tự khai báo không quan trọng** — type được phân giải muộn (lazily), nên bạn có thể dùng type khai báo sau trong type khai báo trước.

```typescript
// Hợp lệ — A dùng B dù B khai báo sau
type A = B[];
type B = string;
```

## 10. Bài tập

1. Viết `DeepReadonly<T>` — biến mọi property (kể cả property lồng nhau) thành `readonly`.
2. Viết `FunctionKeys<T>` — lấy ra union các key mà value là hàm (gợi ý: dùng mapped type + conditional type).
3. Dùng conditional type viết `IsNever<T> = [T] extends [never] ? true : false` và thử với `never`, `1`, `string`.

## 📚 Tài liệu tham khảo

- TypeScript Handbook — Conditional Types: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html
- TypeScript Handbook — Type Aliases: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases
- `infer`: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types
- Bài liên quan: [1_Conditional-type](../1_Conditional-type/README.md) • [12_Utility-Types](../../12_Utility-Types/README.md) • [13_Mapped-Types](../../13_Mapped-Types/README.md)
