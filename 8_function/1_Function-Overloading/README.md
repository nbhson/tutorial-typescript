# Function overloading

> TypeScript cung cấp khái niệm nạp chồng hàm. Bạn có thể có nhiều hàm có cùng tên nhưng kiểu tham số và kiểu trả về khác nhau. **Tuy nhiên, số lượng các tham số phải giống nhau.**

## Nạp chồng hàm là gì?

Trong nhiều ngôn ngữ (Java, C#...), nạp chồng hàm (function overloading) cho phép định nghĩa nhiều hàm trùng tên với chữ ký (signature) khác nhau. JavaScript **không hỗ trợ** điều này — hàm sau sẽ ghi đè hàm trước. TypeScript bù đắp bằng cách cho phép khai báo **nhiều overload signature** cho **một** implementation.

## Cấu trúc: Overload Signatures + Implementation

```ts
// Các overload signature - chỉ để khai báo, không có body
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
// Implementation signature - có body, không gọi trực tiếp được từ bên ngoài
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}

const d1 = makeDate(12345678); // ✅ gọi theo overload 1
const d2 = makeDate(5, 5, 2026); // ✅ gọi theo overload 2
// const d3 = makeDate(5, 5); // ❌ Error: No overload expects 2 arguments
```

> ⚠️ **Quan trọng:** Implementation signature **không hiển thị** với bên ngoài. Từ góc nhìn người gọi, chỉ các overload mới "nhìn thấy" được. Vì vậy implementation phải **tương thích** với tất cả các overload.

## Ví dụ thực tế: hàm trả về kiểu khác nhau theo tham số

```ts
// Parse giá trị: string -> string, number -> number
function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number): string | number {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
}

const a = parse('  hello  '); // type: string ✅ (không phải string | number)
const b = parse(42); // type: number ✅
```

Nếu không dùng overload mà trả về union `string | number` trực tiếp, thì `a.toUpperCase()` sẽ bị lỗi vì phải narrow trước.

## Overloading với optional và rest parameters

```ts
// Tính tổng: có thể truyền 2 hoặc 3 số
function sum(a: number, b: number): number;
function sum(a: number, b: number, c: number): number;
function sum(a: number, b: number, c?: number): number {
  return c !== undefined ? a + b + c : a + b;
}

sum(1, 2); // 3
sum(1, 2, 3); // 6
// sum(1); // ❌ Error: No overload expects 1 argument
// sum(1, 2, 3, 4); // ❌ Error: No overload expects 4 arguments

// Dùng union tham số thay thế khi có thể (đơn giản hơn)
function listen(port: string | number): void {
  console.log(`Listening on ${port}`);
}
```

> **Nguyên tắc:** Chỉ dùng overload khi **số lượng hoặc kiểu tham số thật sự thay đổi cách hàm hoạt động**. Nếu chỉ chấp nhận nhiều kiểu cho cùng một tham số, hãy dùng union — đơn giản hơn.

## Constructor Overloading (TypeScript hỗ trợ từ các phiên bản sớm)

Class cũng hỗ trợ constructor overloading với cùng cú pháp:

```ts
class Point {
  x: number;
  y: number;

  // Overload 1: từ tọa độ x, y
  constructor(x: number, y: number);
  // Overload 2: từ object { x, y }
  constructor(coords: { x: number; y: number });
  // Overload 3: không tham số - mặc định (0, 0)
  constructor(xOrCoords?: number | { x: number; y: number }, y?: number) {
    if (typeof xOrCoords === 'object') {
      this.x = xOrCoords.x;
      this.y = xOrCoords.y;
    } else {
      this.x = xOrCoords ?? 0;
      this.y = y ?? 0;
    }
  }
}

const p1 = new Point(1, 2); // ✅
const p2 = new Point({ x: 3, y: 4 }); // ✅
const p3 = new Point(); // ✅ (0, 0)
```

## Overloading với generic

```ts
function first<T>(arr: T[]): T | undefined;
function first(str: string): string | undefined;
function first(value: any[] | string): any {
  return value[0];
}

const n = first([1, 2, 3]); // type: number | undefined
const s = first('hello'); // type: string
```

## Overloading trong thư viện chuẩn (ví dụ thực tế)

Nhiều API quen thuộc được khai báo bằng overload, ví dụ `document.createElement`:

```ts
interface Document {
  // Overload theo tag name để trả về element type chính xác
  createElement(tagName: 'div'): HTMLDivElement;
  createElement(tagName: 'canvas'): HTMLCanvasElement;
  createElement(tagName: 'input'): HTMLInputElement;
  createElement(tagName: string): HTMLElement;
}

const div = document.createElement('div'); // type: HTMLDivElement ✅
const canvas = document.createElement('canvas'); // type: HTMLCanvasElement ✅
const custom = document.createElement('my-widget'); // type: HTMLElement
```

## Lưu ý thứ tự overload

TypeScript chọn overload **theo thứ tự khai báo, từ trên xuống**. Hãy đặt overload **cụ thể nhất** lên trước:

```ts
// ❌ Sai thứ tự: overload rộng (string) bắt mọi thứ, overload cụ thể không bao giờ khớp
function get(x: string): string;
function get(x: 'special'): 'special'; // không bao giờ được chọn

// ✅ Đúng: cụ thể trước, rộng sau
function pick(x: 'special'): 'special';
function pick(x: string): string;
function pick(x: string): string {
  return x;
}
```

## Tổng kết

| Khái niệm | Mô tả |
|---|---|
| Overload signature | Khai báo các "hình dạng" gọi hàm khác nhau (không body) |
| Implementation | Một implementation duy nhất, phải tương thích mọi overload |
| Constructor overloading | Áp dụng tương tự cho `constructor` của class |
| Union type | Ưu tiên dùng khi chỉ khác biệt về kiểu tham số |
| Thứ tự overload | Cụ thể nhất lên trước, rộng nhất xuống cuối |

## Tài liệu tham khảo

- [Function Overloads - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
- [Functions - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/functions.html)
