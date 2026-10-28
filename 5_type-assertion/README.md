# Type Assertion

> Chuyển đổi các kiểu dữ liệu qua lại với nhau (ép kiểu dữ liệu)

**Type Assertion** (khẳng định kiểu) là cách nói với compiler: *"Tôi biết rõ kiểu của giá trị này hơn bạn, hãy tin tôi"*. Assertion **không thay đổi dữ liệu lúc runtime** — nó chỉ ảnh hưởng đến khâu kiểm tra kiểu.

## Cú pháp cơ bản

```ts
let code: any = 123; 
let employeeCode = <number> code; 
console.log(typeof(employeeCode)); //Output: number
```

```ts
let mVariable: any = 'Typescript training'; // đang kiểu any
// let total = (<string>mVariable).length  // cách 1 
let total = (mVariable as string).length // cách 2
console.log(total);
```

> ⚠️ **Lưu ý:** Cú pháp angle-bracket `<number>code` **không dùng được trong file `.tsx`** (JSX) vì bị hiểu là JSX element. Vì vậy, cộng đồng hiện khuyến nghị dùng cú pháp `as` everywhere.

## Quy tắc: Assertion chỉ hợp lệ khi 2 kiểu "gần" nhau

```ts
let x = 'hello';
// let y = x as number; // ❌ Error: Conversion of type 'string' to type 'number' may be a mistake

// ✅ Chuyển gián tiếp qua unknown nếu thực sự cần (hạn chế dùng)
let y = x as unknown as number;
```

## `as const` (TypeScript 3.4+)

`as const` ép toàn bộ giá trị thành **literal type** và `readonly` — rất hữu ích cho hằng số, config:

```ts
// Không có as const - type rộng
let color = 'red'; // type: string
const colors = ['red', 'green']; // type: string[]

// Có as const - type chính xác + readonly
const colorLiteral = 'red' as const; // type: 'red'
const colorsFrozen = ['red', 'green'] as const; // readonly ['red', 'green']
// colorsFrozen.push('blue'); // ❌ Error: Property 'push' does not exist

// Ví dụ thực tế: tránh lỗi "string not assignable to union"
type Direction = 'up' | 'down' | 'left' | 'right';

// ❌ Error: type 'string' is not assignable to 'Direction'
// let dir: Direction = 'up';

// ✅ Cách 1: as const
const dir = 'up' as const; // type: 'up'

// ✅ Cách 2: dùng với object
const config = {
  endpoint: '/api/users',
  method: 'GET',
} as const;
// type: { readonly endpoint: '/api/users'; readonly method: 'GET' }
config.endpoint = '/api/posts'; // ❌ Error: readonly
```

## `satisfies` operator (TypeScript 4.9+)

`satisfies` là tính năng quan trọng của **TypeScript 4.9**: kiểm tra giá trị **phù hợp** với một type, nhưng **vẫn giữ nguyên kiểu cụ thể (literal) đã suy luận** — khắc phục nhược điểm của cả annotation lẫn `as`:

```ts
type Config = {
  host: string;
  port: number | string;
};

// ❌ Cách cũ - annotation: mất thông tin literal
const config1: Config = {
  host: 'localhost',
  port: '8080',
};
config1.port.toUpperCase(); // ❌ Error vì Config.port là number | string

// ❌ Cách cũ - as: không kiểm tra lỗi chính tả property
const config2 = {
  hostt: 'localhost', // lỗi chính tả KHÔNG được phát hiện!
  port: '8080',
} as Config;

// ✅ Cách mới - satisfies: vừa kiểm tra, vừa giữ literal type
const config3 = {
  host: 'localhost',
  port: '8080',
} satisfies Config;
config3.port.toUpperCase(); // ✅ ok! vì port được giữ là string literal
```

Ví dụ thực tế với bản ghi (record):

```ts
type Route = { path: string; auth: boolean };

const routes = {
  home: { path: '/', auth: false },
  admin: { path: '/admin', auth: true },
  // typo: 'will-crash', // ❌ Error nếu bật - satisfies phát hiện ngay
} satisfies Record<string, Route>;

// Vẫn truy cập được key cụ thể với literal type
routes.home.auth; // false - TS biết chính xác
const routeKey: keyof typeof routes = 'admin'; // ok
// const badKey: keyof typeof routes = 'login'; // ❌ Error
```

## Type Assertion với DOM

```ts
const input = document.getElementById('email') as HTMLInputElement;
console.log(input.value); // ✅ TS biết input có thuộc tính .value

// an toàn hơn: kiểm tra null trước khi assert
const btn = document.querySelector('#submit') as HTMLButtonElement | null;
if (btn) {
  btn.disabled = true;
}
```

## Type Assertion vs Type Conversion

Assertion **không** convert dữ liệu như `Number('123')` hay `String(123)`:

```ts
let str = '123' as unknown as number; // "ép kiểu" chỉ trên giấy - runtime vẫn là string
console.log(typeof str); // 'string' ❗

let realNumber = Number('123'); // ✅ đây mới là conversion thật
console.log(typeof realNumber); // 'number'
```

## Type Narrowing với Assertion

```ts
type Response = { status: 'success'; data: string[] } | { status: 'error'; message: string };

function handle(res: Response) {
  if (res.status === 'success') {
    console.log(res.data.join(', ')); // narrowing tự động, không cần assertion
  } else {
    console.log(res.message);
  }
}

// Double assertion qua unknown - dùng khi dữ liệu đến từ API/parser
const raw = JSON.parse('{"name":"John"}') as { name: string };
const unsafe = (raw as unknown) as { name: string; age: number }; // ⚠️ tự chịu rủi ro
```

## So sánh `as`, `satisfies` và annotation

| Kỹ thuật | Kiểm tra type | Giữ literal type | Phiên bản |
|---|---|---|---|
| `: Type` (annotation) | ✅ | ❌ (nới rộng) | Từ đầu |
| `as Type` (assertion) | ❌ (tin tưởng mù quáng) | ❌ | Từ đầu (`as` từ TS 1.x) |
| `satisfies Type` | ✅ | ✅ | **TypeScript 4.9+** |

> **Khuyến nghị hiện đại (2025-2026):** Ưu tiên `satisfies` khi cần kiểm tra cấu trúc nhưng vẫn giữ literal type; hạn chế tối đa `as` vì nó tắt kiểm tra.

## Tài liệu tham khảo

- [`satisfies` - TypeScript 4.9 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- [`as const` - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference)
- [Type Assertions - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
