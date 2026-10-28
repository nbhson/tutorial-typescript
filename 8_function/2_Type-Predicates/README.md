# Type Predicates & Type Narrowing

> **Type Predicate** (vị từ kiểu) là một kiểu trả về đặc biệt của function dạng `value is Type`, dùng để tạo **custom type guard** — hàm kiểm tra kiểu tùy chỉnh.

TypeScript chỉ tự narrowing qua `typeof`, `instanceof`, `in`, truthiness... Nhưng với dữ liệu phức tạp (object từ API, dữ liệu parse từ JSON), bạn cần **viết hàm kiểm tra của riêng mình** — đó là lúc type predicates phát huy tác dụng.

## Cú pháp `value is Type`

```ts
// Type predicate: parameterName is Type
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function process(value: string | number) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // ✅ value được narrow thành string
  } else {
    console.log(value.toFixed(2));    // ✅ value được narrow thành number
  }
}
```

> ⚠️ **Quan trọng:** `value is string` khác với `boolean`. Nếu hàm trả về `boolean` thay vì `value is string`, TypeScript **không** narrow được kiểu. Type predicate là một "hợp đồng" với compiler: *"nếu hàm trả về true, thì value chắc chắn là Type"*.

## Ví dụ thực tế: kiểm tra object từ API

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

// Dữ liệu từ API/JSON.parse là unknown - phải kiểm tra
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value &&
    typeof (value as User).id === 'number' &&
    typeof (value as User).name === 'string' &&
    typeof (value as User).email === 'string'
  );
}

async function loadUser(json: string) {
  const data: unknown = JSON.parse(json);

  if (isUser(data)) {
    console.log(data.name);      // ✅ data: User
    console.log(data.email);     // ✅
  } else {
    console.error('Dữ liệu không đúng định dạng User');
  }
}
```

## `asserts` - Assertion function (TypeScript 3.7+)

Khác với type predicate, `asserts` **không trả về giá trị** — nếu điều kiện sai, hàm phải **throw**. Sau khi gọi, kiểu được narrow **mà không cần if**:

```ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function greet(input: unknown) {
  assertIsString(input);      // nếu không throw, input là string từ đây
  console.log(input.toUpperCase()); // ✅
}
```

```ts
// asserts điều kiện tổng quát
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function divide(a: number | null, b: number | null) {
  assert(a !== null && b !== null, 'Không được chia null');
  return a / b; // ✅ a, b được narrow thành number
}
```

> **Khi nào dùng gì?** Dùng `is` khi muốn **if/else branching** (narrow ở cả 2 nhánh). Dùng `asserts` khi muốn **fail-fast** (dừng ngay nếu sai, không có nhánh "sai" để xử lý).

## Inferred Type Predicates (TypeScript 5.5+)

Từ **TypeScript 5.5**, TS có thể **tự suy ra type predicate** cho các hàm đơn giản — không cần viết thủ công:

```ts
// Trước TS 5.5: filter(x => x !== null) không narrow được
// Từ TS 5.5: TS tự hiểu

const names = ['Alice', null, 'Bob', undefined, 'Carol'];

// TS 5.5+ tự infer: (x: string | null | undefined) => x is string
const validNames = names.filter(x => x !== null && x !== undefined);
// validNames: string[] ✅ (trước 5.5 là (string | null | undefined)[])
```

## Filter mảng với custom type guard

```ts
interface Bird { fly(): void }
interface Fish { swim(): void }

// Trước TS 5.5: cần type predicate thủ công
function isBird(animal: Bird | Fish): animal is Bird {
  return 'fly' in animal;
}

const animals: (Bird | Fish)[] = [bird1, fish1, bird2];

// Cách 1: dùng type predicate tùy chỉnh (hoạt động mọi phiên bản)
const birds = animals.filter(isBird); // Bird[]

// Cách 2: từ TS 5.5, arrow function đơn giản cũng tự infer
const fishes = animals.filter(a => 'swim' in a); // Fish[] ✅
```

## `instanceof` narrowing

```ts
class ApiError extends Error {
  constructor(public statusCode: number) { super(); }
}

class ValidationError extends Error {
  constructor(public field: string) { super(); }
}

function handleError(err: Error) {
  if (err instanceof ApiError) {
    console.log(`Lỗi server: ${err.statusCode}`); // err: ApiError
  } else if (err instanceof ValidationError) {
    console.log(`Sai trường: ${err.field}`);      // err: ValidationError
  } else {
    console.log(err.message); // err: Error
  }
}
```

## `in` operator narrowing

```ts
interface Admin {
  role: 'admin';
  permissions: string[];
}

interface Guest {
  role: 'guest';
  lastVisit: Date;
}

function dashboard(user: Admin | Guest) {
  if ('permissions' in user) {
    console.log(user.permissions.length); // user: Admin
  } else {
    console.log(user.lastVisit);          // user: Guest
  }
}
```

## Discriminated union + switch (xem chi tiết tại `3_data-type/7_Union`)

```ts
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function handle<T>(result: Result<T>) {
  if (result.ok) {
    return result.value; // result: { ok: true; value: T }
  }
  throw new Error(result.error); // result: { ok: false; error: string }
}
```

## Sự thật và sai lầm thường gặp

```ts
// ❌ SAI: trả về boolean thay vì type predicate - không narrow được
function isStringWrong(value: unknown): boolean {
  return typeof value === 'string';
}

// ✅ ĐÚNG: type predicate
function isStringRight(value: unknown): value is string {
  return typeof value === 'string';
}

// ⚠️ CẢNH BÁO: type predicate sai sự thật - compiler không kiểm tra logic bên trong!
function isStringLie(value: unknown): value is string {
  return typeof value === 'number'; // ❗ Logic sai nhưng compile vẫn pass
}
// Từ TypeScript 5.5, TS kiểm tra chặt hơn với inferred predicates,
// nhưng với predicate viết tay, bạn vẫn phải tự chịu trách nhiệm.
```

## Tổng kết

| Kỹ thuật | Cú pháp | Phiên bản | Dùng khi |
|---|---|---|---|
| Type predicate | `x is T` | Từ đầu (TS 1.x/2.x) | Cần custom guard, narrow ở cả 2 nhánh |
| Assertion function | `asserts x is T` | **TypeScript 3.7+** | Fail-fast, throw khi sai |
| `asserts condition` | `asserts condition` | **TypeScript 3.7+** | Kiểm tra điều kiện tổng quát |
| Inferred predicates | (tự động) | **TypeScript 5.5+** | Filter/narrow đơn giản, không cần viết tay |
| `instanceof` | `x instanceof Class` | Từ đầu | Kiểm tra class |
| `in` | `'prop' in x` | Từ đầu | Kiểm tra property của object |

## Tài liệu tham khảo

- [Narrowing - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [Assertion Functions - TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions)
- [Inferred Type Predicates - TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html#inferred-type-predicates)
