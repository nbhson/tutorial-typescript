# Conditional Type 

## Conditional Type là gì?

- `Conditional Type` có mặt trong TS từ version 2.8 và có thể nói đây là một trong những tính năng nổi bật nhất của TS.
- `Conditional Type`, đúng như tên gọi của nó, giúp cho chúng ta có thể tạo ra những type theo điều kiện. Điều này dẫn đến 1 hệ thống type cực kỳ linh hoạt (robust) mà TS mang lại cho người dùng.

```ts
T extends U ? X : Y;
```

Đoạn code trên có thể hiểu nôm na là khi type T có thể gán được cho type U thì sẽ trả về type X, còn không thì trả về type Y.

## Ví dụ cơ bản

```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<'hello'>; // true (literal 'hello' extends string)
```

## Nested Conditional - Conditional Type lồng nhau

```ts
type TypeName<T> =
  T extends string   ? 'string'  :
  T extends number   ? 'number'  :
  T extends boolean  ? 'boolean' :
  T extends Function ? 'function':
  'object';

type T1 = TypeName<'hello'>;      // 'string'
type T2 = TypeName<42>;           // 'number'
type T3 = TypeName<() => void>;   // 'function'
type T4 = TypeName<{ a: 1 }>;     // 'object'
```

## Distributive Conditional Type (TypeScript 2.8+)

Khi conditional type nhận vào **union type**, điều kiện sẽ được áp dụng **cho từng thành phần** rồi gộp lại (distributive):

```ts
type ToArray<T> = T extends any ? T[] : never;

type R1 = ToArray<string | number>; // string[] | number[]
// Không phải (string | number)[]
```

Distributive chính là cách `Exclude` hoạt động:

```ts
type Exclude<T, U> = T extends U ? never : T;

type T1 = Exclude<'a' | 'b' | 'c', 'a'>; // 'b' | 'c'
// Từng bước: 'a' extends 'a' ? never : 'a'  ->  never
//            'b' extends 'a' ? never : 'b'  ->  'b'
//            'c' extends 'a' ? never : 'c'  ->  'c'
// => never | 'b' | 'c' = 'b' | 'c'
```

### Chặn distributive với `[T]`

Bao type trong dấu ngoặc vuông để **ngăn** phân tách union:

```ts
type IsStringDistributed<T> = T extends string ? true : false;
type IsStringStrict<T> = [T] extends [string] ? true : false;

type A = IsStringDistributed<string | number>; // boolean (true | false)
type B = IsStringStrict<string | number>;      // false - union không phải string
```

## `infer` keyword (TypeScript 2.8+)

`infer` cho phép **khai báo một biến kiểu** bên trong điều kiện, để TS tự suy ra (infer) kiểu tại vị trí đó:

```ts
// Infer kiểu trả về của function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R1 = ReturnType<() => string>;        // string
type R2 = ReturnType<(x: number) => void>; // void

// Infer kiểu phần tử của mảng
type ElementType<T> = T extends (infer E)[] ? E : never;
type E1 = ElementType<string[]>;  // string
type E2 = ElementType<number[]>;  // number

// Infer các phần của Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type U1 = UnwrapPromise<Promise<string>>;  // string
type U2 = UnwrapPromise<Promise<number>[]>; // Promise<number>[] - không phải Promise nên giữ nguyên

// Infer tham số của function
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type P1 = Parameters<(name: string, age: number) => void>; // [name: string, age: number]

// Nhiều infer cùng lúc
type Unpack<T> = T extends { id: infer I; name: infer N } ? [I, N] : never;
type U3 = Unpack<{ id: number; name: string }>; // [number, string]
```

> 💡 Từ **TypeScript 4.7+**, `infer` còn hỗ trợ **constraint**: `T extends (...args: any[]) => infer R extends string ? R : never`.

## Recursive Conditional Type (TypeScript 4.1+)

Từ **TypeScript 4.1**, conditional type có thể **gọi đệ quy chính nó** — mở khóa khả năng xử lý sâu kiểu lồng nhau:

```ts
// Đệ quy: "làm phẳng" mảng nhiều chiều
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;

type F1 = Flatten<number[]>;        // number
type F2 = Flatten<number[][]>;      // number
type F3 = Flatten<number[][][]>;    // number

// Chờ đợi (unwrap) nhiều lớp Promise
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T; // tương tự Awaited chuẩn

type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;
type D1 = DeepAwaited<Promise<Promise<string>>>; // string

// Đếm chiều sâu của tuple
type Depth<T> = T extends Array<infer U> ? [unknown] extends [T] ? never : 1 + Depth<U> : 0;
type DeepFlatten<T> = T extends Array<infer U> ? DeepFlatten<U>[] : T;

type D2 = DeepFlatten<[1, [2, [3, [4]]]]>; // [1, 2, 3, 4] - làm phẳng hoàn toàn
```

> ⚠️ **Lưu ý:** Đệ quy có giới hạn độ sâu (recursion limit ~1000 từ TS 4.x, 50 stack frame từ TS 4.5). Nếu vượt quá sẽ báo lỗi "Type instantiation is excessively deep". Kể từ **TypeScript 4.5**, tail-recursion elimination giúp một số đệ quy chạy sâu hơn.

## Template Literal + Conditional (TypeScript 4.1+)

Kết hợp template literal types với conditional + infer để "parse" chuỗi ở mức type:

```ts
// Trích xuất phần sau dấu chấm trong tên event
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // 'onClick'

// Đệ quy với template literal: camelCase -> PascalCase từng phần
type KebabToCamel<S extends string> =
  S extends `${infer Head}-${infer Tail}`
    ? `${Head}${KebabToCamel<Capitalize<KebabToCamelTail<Tail>>>}`
    : S;
// (ví dụ minh họa - thường dùng helpers như Capitalize, Uppercase, Lowercase)

// Ví dụ đơn giản hơn: loại tiền tố
type RemovePrefix<S extends string> = S extends `api-${infer Rest}` ? Rest : S;
type R1 = RemovePrefix<'api-users'>;  // 'users'
type R2 = RemovePrefix<'users'>;      // 'users' (không khớp, giữ nguyên)
```

## Ứng dụng thực tế: tạo kiểu "không có property nào"

```ts
type NoProps = Record<never, never>;

// Conditional type kiểm tra union rỗng / never
type IsNever<T> = [T] extends [never] ? true : false;
type N1 = IsNever<never>; // true
type N2 = IsNever<string>; // false
```

## Tổng kết

| Tính năng | Phiên bản | Mô tả |
|---|---|---|
| Conditional Type | **2.8+** | `T extends U ? X : Y` |
| Distributive | 2.8+ | Tự áp dụng cho từng thành viên của union |
| `[T] extends [U]` | 2.8+ | Chặn distributive |
| `infer R` | 2.8+ | Suy luận kiểu tại vị trí bất kỳ |
| Recursive conditional | **4.1+** | Đệ quy trong type |
| Tail-recursion tối ưu | 4.5+ | Hỗ trợ đệ quy sâu hơn |
| `infer ... extends` | 4.7+ | Giới hạn kiểu được infer |

## Tài liệu tham khảo

- [Conditional Types - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html#conditional-types)
- [`infer` - TypeScript 2.8 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#conditional-types)
- [Recursive Types - TypeScript 4.1 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
