# Union

> Cho phép sử dụng nhiều hơn 1 kiểu dữ liệu, dùng cho một biến hoặc 1 tham số hàm

```ts
function listen(port: string | number) {
  // do listen
}

listen('3000'); // ok
listen(3000); // ok
listen(true); // TypeError: Argument of type true is not assignable to parameter type string | number
listen(); // TypeError: Invalid number of arguments, expected 1
```

Để tái sử dụng (reuse) 1 Union Type bất kỳ, các bạn có thể tạo Type Alias cho Union Type đó

```ts
type StringOrNumber = string | number;

function listen(port: StringOrNumber) {...}
function getSomething(): StringOrNumber {...}
```

## Union với literal type

Kết hợp union với **literal type** tạo ra kiểu giới hạn giá trị — thay thế phổ biến cho enum:

```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function request(method: HttpMethod, url: string) {
  console.log(`${method} ${url}`);
}

request('GET', '/api/users'); // ✅
// request('FETCH', '/api/users'); // ❌ Error: chỉ chấp nhận 'GET' | 'POST' | 'DELETE' | 'PUT'
```

## Type Narrowing với Union

Khi làm việc với biến union, phải **thu hẹp (narrow)** kiểu trước khi gọi method riêng của từng kiểu:

```ts
function format(value: string | number): string {
  // ❌ Error: Property 'toUpperCase' does not exist on type 'string | number'
  // return value.toUpperCase();

  if (typeof value === 'string') {
    return value.toUpperCase(); // value: string
  }
  return value.toFixed(2); // value: number
}
```

## Discriminated Unions - Union có thuộc tính phân biệt

**Discriminated union** (định danh union) là kỹ thuật quan trọng: mỗi thành viên của union có **một thuộc tính chung với literal type riêng** (thường gọi là `kind`, `type`, `status`...). TypeScript dùng thuộc tính này để narrow chính xác:

```ts
// Các "biến thể" chia sẻ property `kind`
type Circle = { kind: 'circle'; radius: number };
type Rectangle = { kind: 'rectangle'; width: number; height: number };
type Square = { kind: 'square'; side: number };

type Shape = Circle | Rectangle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2; // shape: Circle ✅
    case 'rectangle':
      return shape.width * shape.height;  // shape: Rectangle ✅
    case 'square':
      return shape.side ** 2;             // shape: Square ✅
  }
}

area({ kind: 'circle', radius: 5 });       // 78.54...
area({ kind: 'rectangle', width: 2, height: 3 } as Rectangle); // 6
// area({ kind: 'hexagon' }); // ❌ Error ngay khi compile
```

### Ví dụ thực tế: trạng thái request (pattern rất phổ biến)

```ts
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function render<T>(state: RequestState<T>): string {
  switch (state.status) {
    case 'idle':
      return 'Chưa bắt đầu';
    case 'loading':
      return 'Đang tải...';
    case 'success':
      return `Dữ liệu: ${JSON.stringify(state.data)}`; // state.data luôn tồn tại ✅
    case 'error':
      return `Lỗi: ${state.message}`; // state.message luôn tồn tại ✅
  }
}
```

Ưu điểm so với kiểu "lỏng" như `{ status: string; data?: T; message?: string }`:
- **Không thể** tạo object `loading` kèm `data` vô nghĩa
- Không cần optional chaining hay check rải rác
- Editor tự gợi ý đúng thuộc tính cho từng case

## Exhaustive Checks - Kiểm tra đủ các trường hợp (never + default)

Kỹ thuật với `never` đảm bảo nếu thêm thành viên mới vào union mà quên xử lý, **compile sẽ báo lỗi ngay**:

```ts
type PaymentMethod =
  | { type: 'card'; cardNumber: string }
  | { type: 'bank'; accountNumber: string }
  | { type: 'momo'; phone: string };

function processPayment(payment: PaymentMethod): void {
  switch (payment.type) {
    case 'card':
      console.log(`Thanh toán thẻ ${payment.cardNumber}`);
      break;
    case 'bank':
      console.log(`Chuyển khoản ${payment.accountNumber}`);
      break;
    case 'momo':
      console.log(`Ví MoMo ${payment.phone}`);
      break;
    default: {
      // Nếu thêm { type: 'zalopay' } mà quên xử lý ở trên,
      // dòng dưới báo lỗi compile: Type '"zalopay"' is not assignable to 'never'
      const _exhaustive: never = payment;
      return _exhaustive;
    }
  }
}
```

### Hàm `assertNever` tái sử dụng

```ts
function assertNever(x: never): never {
  throw new Error('Thiếu case xử lý: ' + JSON.stringify(x));
}

function getLabel(shape: Shape): string {
  switch (shape.kind) {
    case 'circle': return 'Hình tròn';
    case 'rectangle': return 'Hình chữ nhật';
    case 'square': return 'Hình vuông';
    default:
      return assertNever(shape); // an toàn: bắt buộc xử lý đủ
  }
}
```

## Union với undefined/null (optional values)

```ts
type Maybe<T> = T | null | undefined;

function findUser(id: number): Maybe<{ id: number; name: string }> {
  return id === 1 ? { id: 1, name: 'Sơn' } : null;
}

const user = findUser(1);
// console.log(user.name); // ❌ Error - phải narrow trước
if (user) {
  console.log(user.name); // ✅
}
```

## Tổng kết

| Kỹ thuật | Mô tả |
|---|---|
| Union `A \| B` | Biến nhận 1 trong nhiều kiểu |
| Literal union | Giới hạn giá trị cụ thể (`'GET' \| 'POST'`) |
| Discriminated union | Nhóm các object shape theo 1 field chung (`kind`) |
| Exhaustive check với `never` | Bắt lỗi compile khi thiếu case |
| Narrowing | `typeof`, `in`, `instanceof`, so sánh literal |

## Tài liệu tham khảo

- [Narrowing - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Discriminated Unions - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [Unions - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
