# Type Annotation

> Khai báo kiểu dữ liệu cho biến, default param, object, kiểu trả về của function khi khởi tạo

**Type Annotation** (chú thích kiểu) là cách chúng ta **khai báo tường minh** kiểu dữ liệu cho biến, tham số hàm, giá trị trả về... bằng cú pháp `: Type`. Đây là nền tảng cơ bản nhất của TypeScript.

## Cú pháp cơ bản

```ts
let username: string = 'Sơn';
let age: number = 23;
let isStudent: boolean = true;
let scores: number[] = [8, 9, 10];
let tuple: [string, number] = ['John', 20];

function greet(name: string): string {
  return `Xin chào, ${name}!`;
}

// Kiểu trả về của function
function sum(a: number, b: number): number {
  return a + b;
}

// Void - hàm không trả về giá trị
function log(message: string): void {
  console.log(message);
}
```

## Type Inference - Suy luận kiểu tự động (từ phiên bản đầu tiên)

TypeScript **thông minh** đến mức có thể tự suy ra (infer) kiểu dữ liệu từ giá trị khởi tạo, mà không cần annotation:

```ts
let message = 'Hello TypeScript'; // TS infer: string
// message = 123; // ❌ Error: Type 'number' is not assignable to type 'string'

let count = 0; // infer: number
count += 1; // ok

// Lưu ý: inference hoạt động với let, nhưng const sẽ narrow xuống literal type
const direction = 'north'; // type: 'north' (literal type, không phải string)
```

> **Khi nào nên viết annotation?** Khi biến được khai báo mà **không gán giá trị ngay** (VD: tham số hàm, biến class), hoặc khi muốn **thu hẹp** kiểu rộng hơn (VD: gán union type). Nếu khởi tạo giá trị trực tiếp, hãy để TS tự infer.

## `any` vs `unknown` (any: từ đầu; unknown: TypeScript 3.0+)

Cả hai đều có thể nhận **bất kỳ** giá trị nào, nhưng khác nhau về độ an toàn:

```ts
// any - tắt hoàn toàn kiểm tra kiểu, RẤT nguy hiểm
let anything: any = 'hello';
anything.foo.bar(); // ❗ Không lỗi khi compile, nhưng crash lúc runtime!
anything = 123;
anything = true; // gán gì cũng được

// unknown - an toàn: bắt buộc phải narrow kiểu trước khi dùng
let safeValue: unknown = 'hello';
// safeValue.toUpperCase(); // ❌ Error: 'safeValue' is of type 'unknown'

if (typeof safeValue === 'string') {
  safeValue.toUpperCase(); // ✅ ok, vì đã narrow thành string
}
```

> **Khuyến nghị:** Luôn dùng `unknown` thay cho `any` khi chưa biết kiểu. Dùng `any` chỉ khi migrate code JS hoặc trong trường hợp đặc biệt. Kể từ **TypeScript 6.0**, `strict` mặc định bật `true`, nên hạn chế `any` càng nhiều càng tốt.

## `never` type (TypeScript 2.0+)

`never` là kiểu của những giá trị **không bao giờ tồn tại**. Dùng cho:
- Hàm luôn `throw` lỗi hoặc chạy vô hạn (không bao giờ return)
- Kiểu sau khi đã loại bỏ hết mọi trường hợp (bottom type)

```ts
// Hàm throw exception - kiểu trả về là never
function fail(message: string): never {
  throw new Error(message);
}

// Hàm chạy vô hạn - không bao giờ kết thúc
function infiniteLoop(): never {
  while (true) {}
}

// Biến kiểu never không thể nhận giá trị nào
let impossible: never;
// impossible = 123; // ❌ Error
// impossible = fail('x'); // ✅ vì fail() trả về never
```

### `never` với exhaustive check

```ts
type Shape = 'circle' | 'square' | 'triangle';

function area(shape: Shape): number {
  switch (shape) {
    case 'circle':
      return Math.PI;
    case 'square':
      return 1;
    case 'triangle':
      return 0.5;
    default:
      // Nếu thêm shape mới mà quên xử lý, dòng này sẽ báo lỗi compile!
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

## Type Guards - Bảo vệ kiểu (TypeScript 2.0+, cải tiến dần qua các phiên bản)

Type Guards là các kỹ thuật giúp **thu hẹp (narrowing)** kiểu của biến trong một phạm vi code:

```ts
// 1. typeof guard
function process(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // value: string
  } else {
    console.log(value.toFixed(2)); // value: number
  }
}

// 2. instanceof guard
class Bird { fly() { console.log('Bay'); } }
class Fish { swim() { console.log('Bơi'); } }

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly(); // animal: Bird
  } else {
    animal.swim(); // animal: Fish
  }
}

// 3. in operator guard
interface Admin { role: 'admin'; permissions: string[] }
interface Guest { role: 'guest'; visitCount: number }

function describe(user: Admin | Guest) {
  if ('permissions' in user) {
    console.log(user.permissions); // user: Admin
  } else {
    console.log(user.visitCount); // user: Guest
  }
}

// 4. Truthiness guard
function greetUser(name: string | null) {
  if (name) {
    console.log(name.toUpperCase()); // name: string (loại null)
  }
}
```

Từ **TypeScript 5.5+**, TS còn có thể **tự suy ra type predicate** cho các hàm filter đơn giản như `arr.filter(x => x !== null)` mà không cần viết thủ công.

## Default Parameters với Type Annotation

```ts
function createUser(
  name: string = 'Ẩn danh',
  age: number = 18,
  isAdmin: boolean = false
): string {
  return `${name} - ${age} - ${isAdmin}`;
}

createUser(); // 'Ẩn danh - 18 - false'
createUser('Sơn', 23); // 'Sơn - 23 - false'
```

## Type Annotation cho Object và Function Type

```ts
// Object type inline
let user: { name: string; age: number } = { name: 'Sơn', age: 23 };

// Function type
let calculator: (a: number, b: number) => number;
calculator = (a, b) => a + b; // TS tự infer a, b là number
calculator = (a, b) => a * b;

// Array of objects
let users: Array<{ id: number; name: string }> = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
];
```

## Tổng kết

| Khái niệm | Mô tả |
|---|---|
| Type Annotation | Khai báo kiểu tường minh với `: Type` |
| Type Inference | TS tự suy ra kiểu từ giá trị khởi tạo |
| `any` | Tắt kiểm tra kiểu - tránh dùng |
| `unknown` | An toàn, phải narrow trước khi dùng (TS 3.0+) |
| `never` | Kiểu không bao giờ tồn tại (TS 2.0+) |
| Type Guards | Thu hẹp kiểu: `typeof`, `instanceof`, `in`, truthiness |

## Tài liệu tham khảo

- [Everyday Types - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Narrowing - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [`unknown` - TypeScript 3.0 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#unknown-type)
