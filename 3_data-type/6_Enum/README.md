# Enum

> Lưu trữ giá trị chuỗi dưới dạng số

**Enum** cho phép định nghĩa một tập hợp **hằng số có tên** (named constants). Enum được dịch sang JavaScript cả lúc runtime (khác với `union type` chỉ tồn tại lúc compile), nên enum là một trong những **đặc trưng không thuần JavaScript** của TypeScript.

## Numeric Enum - Enum số (mặc định)

Khi không gán giá trị, TS tự gán tăng dần từ `0` (hoặc từ giá trị trước + 1):

```ts
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}
console.log(Direction.Up); // 0
console.log(Direction[2]); // 'Left' - truy cập ngược

// Gán giá trị thủ công, phần sau tự tăng
enum StatusCode {
  OK = 200,
  Created = 201,          // 201
  BadRequest = 400,
  Unauthorized,           // 401 (400 + 1)
}
```

## Reverse Mapping 

```ts
enum PrintMedia {
    Newspaper = 1,
    Newsletter = 5,
    Magazine = 5,
    Book = 10
}

console.log(PrintMedia);

/**
 {
  '1': 'Newspaper',
  '5': 'Magazine',
  '10': 'Book',
  Newspaper: 1,
  Newsletter: 5,
  Magazine: 5,
  Book: 10
}
*/
```

> Reverse mapping (tra ngược từ số -> tên) **chỉ có ở numeric enum**. Chú ý: `Newsletter = 5` và `Magazine = 5` trùng giá trị nên reverse mapping chỉ giữ `'5': 'Magazine'` (phần tử sau ghi đè phần tử trước) — một lý do nên tránh trùng giá trị trong numeric enum.

## Computed Enum - Enum được tính toán

```ts
enum PrintMedia {
  Newsletter = getPrintMediaCode('newsletter'),
  Magazine = Newsletter * 3,
  Newspaper = 0,
  Book, // 1
}

function getPrintMediaCode(mediaName: string): number {
  if (mediaName === 'newsletter') {
      return 5;
  }
}
console.log(PrintMedia.Book);
```

## String Enum

```ts
enum PrintMedia {
  Newspaper = "NEWSPAPER",
  Newsletter = "NEWSLETTER",
  Magazine = "MAGAZINE",
  Book = "BOOK",
}
console.log(PrintMedia.Newspaper); //returns NEWSPAPER
console.log(PrintMedia["Magazine"]); //returns MAGAZINE
```

> **Khuyến nghị:** Dùng **string enum** trong đa số trường hợp — giá trị dễ debug (in ra log thấy chữ), không có reverse mapping, an toàn hơn khi serialize ra API.

## Heterogeneous Enum - Enum không đồng nhất

```ts
enum Status {
  Active = "ACTIVE",
  Deactivate = 1,
  Pending, // 2 - tự tăng từ số trước
}
```

> Heterogeneous enum (trộn số và chuỗi) **không khuyến khích** — thường là dấu hiệu thiết kế chưa rõ ràng. Nên chọn một loại giá trị thống nhất.

## Enum trong hàm và switch

```ts
enum OrderStatus {
  Pending = 'PENDING',
  Shipped = 'SHIPPED',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED',
}

function handleOrder(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Pending:
      console.log('Chờ xử lý');
      break;
    case OrderStatus.Shipped:
      console.log('Đang giao');
      break;
    case OrderStatus.Delivered:
      console.log('Đã giao');
      break;
    case OrderStatus.Cancelled:
      console.log('Đã hủy');
      break;
    default: {
      // Exhaustive check: nếu thêm trạng thái mới mà quên xử lý sẽ báo lỗi compile
      const _never: never = status;
      return _never;
    }
  }
}
```

## `const enum` - Enum hằng (biên dịch trực tiếp giá trị)

`const enum` được **inline** giá trị trực tiếp tại nơi sử dụng, không tạo object runtime — nhẹ hơn:

```ts
const enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE',
}

const c = Color.Red;
// Biên dịch thành: const c = 'RED'; (không có object Color)
```

> ⚠️ **Lưu ý:** `const enum` có một số hạn chế với `isolatedModules` và bundler. Với module hiện đại, nhiều team khuyến nghị dùng **`as const` object** thay cho enum (xem bên dưới). Đây cũng là hướng mà các cấu hình mới (TypeScript 5.9+ `tsc --init`) khuyến khích.

## Enum vs Union Type vs `as const` object

Kể từ các phiên bản gần đây (5.x), nhiều team chuyển từ enum sang union hoặc `as const` object:

```ts
// Cách 1: Enum
enum Level { Low = 'LOW', High = 'HIGH' }

// Cách 2: Union type - không có runtime code, nhẹ nhất
type Level = 'low' | 'high';

// Cách 3: as const object (TypeScript 3.4+) - có giá trị runtime + literal type
const LEVELS = {
  Low: 'low',
  High: 'high',
} as const;
type Level2 = (typeof LEVELS)[keyof typeof LEVELS]; // 'low' | 'high'
```

So sánh nhanh:

| Tiêu chí | `enum` | `const enum` | Union type | `as const` object |
|---|---|---|---|---|
| Runtime object | ✅ | ❌ (inline) | ❌ | ✅ |
| Reverse mapping | Numeric enum ✅ | ❌ | ❌ | ❌ |
| Biên dịch chuẩn JS | ✅ (TS-only feature) | ⚠️ (hạn chế với isolatedModules) | ✅ thuần JS | ✅ thuần JS |

## Tổng kết

- Numeric enum: tự đánh số, có reverse mapping
- String enum: rõ ràng, dễ debug, nên ưu tiên
- `const enum`: inline, không tạo object runtime
- Với codebase hiện đại (TypeScript 5.x/6.x), cân nhắc **union type** hoặc **`as const` object** thay cho enum

## Tài liệu tham khảo

- [Enums - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/enums.html)
- [`as const` - Literal Inference](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference)
