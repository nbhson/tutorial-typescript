# Intersection Type (`&`)

Khác với **Union** (xem bài [7_Union](../7_Union/README.md)) là `a` **hoặc** `b` (`a | b`), thì **Intersection** là `a` **và** `b` (`a & b`) — một giá trị thuộc kiểu intersection phải **đồng thời thỏa mãn tất cả** các type trong tổ hợp.

> Bài này xây dựng trực tiếp trên bài [7_Union](../7_Union/README.md). Nếu bạn chưa nắm union, hãy đọc bài đó trước.

## 1. Kiểu cơ bản với type primitive

Với primitive, intersection thường tạo ra type "chật hơn" — đôi khi chật tới mức không có giá trị nào thỏa mãn:

```ts
// number & string: không có giá trị nào vừa là number vừa là string
let impossible: number & string; // type: never

// hữu ích hơn: giới hạn trong tập con
type PositiveNumber = number & { __brand: 'positive' }; // cách tạo "branded type" — xem phần 6
```

Với object — nơi `&` phát huy công dụng chính — intersection gộp **tất cả các properties** lại:

```ts
type Runnable = {
  run: () => void;
};

type Eatable = {
  eat: () => void;
};

type Pet = Runnable & Eatable;

const pet: Pet = {
  run: () => console.log('running...'),
  eat: () => console.log('eating...'),
}; // bắt buộc có CẢ run và eat
```

## 2. Dùng với function — ví dụ `merge`

```ts
function merge<T1, T2>(o1: T1, o2: T2): T1 & T2 {
  return { ...o1, ...o2 };
}

let result = merge({ foo: 'bar' }, { bar: 'foo' });
console.log(result.foo); // 'bar'
console.log(result.bar); // 'foo'
```

TS biết kết quả có kiểu `T1 & T2`, nên khi bạn gõ `result.` trình soạn thảo sẽ gợi ý **cả** `foo` lẫn `bar`. Đây là điểm mạnh lớn nhất của intersection: **gộp cấu trúc mà không cần khai báo lại type mới**.

> **Lưu ý:** nếu 2 object có property **trùng tên nhưng khác type**, property đó trong kết quả sẽ là intersection của 2 type — thường trở thành `never`:
>
> ```ts
> type A = { value: string };
> type B = { value: number };
> type C = A & B;
>
> const x: C = { value: 'hi' }; // ❌ Error: value phải vừa là string vừa là number → không thể gán
> // C['value'] có kiểu: string & number = never
> ```

## 3. Intersection của nhiều type

Bạn có thể gộp nhiều hơn 2 type, và có thể trộn lẫn object, primitive, function:

```ts
type Name = { name: string };
type Age = { age: number };
type Email = { email: string };

type Person = Name & Age & Email;

const son: Person = {
  name: 'Sơn',
  age: 23,
  email: 'son@example.com',
};
```

## 4. Ứng dụng thật: Type Composition trong thư viện UI

Ngoài những cách sử dụng thông thường trong function hoặc trong những đoạn code mà khái niệm OOP thông thường không áp dụng được, thì Intersection Type được dùng **rất nhiều** trong việc thiết kế hệ thống type cho những thư viện UI Components:

```ts
type StyleProps = {
  backgroundColor: string;
  color: string;
  margin: string;
  padding: string;
};

type ButtonProps = {
  onClick: (event: MouseEvent) => void;
  children: string;
} & StyleProps;

type TextProps = {
  fontSize: string;
  fontWeight: number;
  text: string;
} & StyleProps;

// Cả Button và Text đều "có" đầy đủ các props của StyleProps
const btnProps: ButtonProps = {
  onClick: () => {},
  children: 'Click me',
  backgroundColor: '#fff', // từ StyleProps
  color: '#000',           // từ StyleProps
  margin: '8px',           // từ StyleProps
  padding: '12px',         // từ StyleProps
};
```

Những Component này có những type Style khác nhau, nhưng cũng có những type cơ bản giống nhau. Ví dụ như Text sẽ có thêm `fontSize`, `fontWeight`, còn Button sẽ có `onClick`. Tác giả của những thư viện UI này sẽ sử dụng Intersection Type để viết thư viện UI của họ mà không phải lặp đi lặp lại nhiều 1 số type giống nhau.

Cách dùng Intersection Type này còn có tên gọi khác là **Type Composition** — xem thêm ở [Type Composition](https://www.typescriptlang.org/docs/handbook/2/objects.html).

## 5. `interface extends` vs type `&` — hai cách, một mục đích

```ts
// Cách 1: interface extends
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// Cách 2: intersection
type Cat = Animal & {
  breed: string;
};
```

| Tiêu chí | `interface extends` | `type A & B` |
|---|---|---|
| Property trùng tên khác type | Báo lỗi ngay khi khai báo | Tạo thành `never` (lỗi khi sử dụng) |
| Mở rộng về sau (`declaration merging`) | ✅ Có | ❌ Không |
| Có thể gộp union/primitive | ❌ | ✅ |
| Khả năng tái sử dụng trong generic | Thấp hơn | Cao hơn (phổ biến trong utility types) |

> Quy ước phổ biến: dùng `interface` cho public API của object/class, dùng `&` khi cần "chắp" type động trong generic và utility types.

## 6. Ứng dụng nâng cao: Branded / Nominal type

JS/TS không có khái niệm "type thật sự khác" giữa các type có cùng cấu trúc (structural typing). Intersection + property ảo giúp tạo **branded type** — chống nhầm lẫn giữa các giá trị cùng shape:

```ts
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function getUser(id: UserId) {
  console.log(`Loading user ${id}...`);
}

// Buộc tạo qua hàm "đóng gói" — không thể giả mạo trực tiếp
const asUserId = (id: string): UserId => id as UserId;

const userId = asUserId('user-123');
getUser(userId); // ✅

const orderId = 'order-456' as OrderId;
// getUser(orderId); // ❌ Error: OrderId không gán được cho UserId
// getUser('user-123'); // ❌ Error: string thuần không gán được cho UserId
```

Pattern này được dùng rất nhiều trong codebase lớn để phân biệt `id` loại nào với loại nào, hoặc các dạng string đặc biệt như `Email`, `PhoneNumber`.

## 7. Intersection vs Union — đối chiếu nhanh

```ts
type A = { a: 1 };
type B = { b: 2 };

type Both = A & B; // phải có CẢ a và b
type Either = A | B; // có a HOẶC b

const both: Both = { a: 1, b: 2 };   // ✅
// const both2: Both = { a: 1 };     // ❌ thiếu b

const either1: Either = { a: 1 };    // ✅
const either2: Either = { b: 2 };    // ✅
// const either3: Either = { a: 1, b: 2 }; // ✅ vẫn hợp lệ — có cả 2 cũng được
```

| | Union `a \| b` | Intersection `a & b` |
|---|---|---|
| Logic | HOẶC | VÀ |
| Với object | Ít properties hơn (1 trong 2) | Nhiều properties hơn (gộp tất cả) |
| Với primitive | Tập giá trị rộng hơn | Có thể trở thành `never` |
| Ứng dụng chính | Hạn chế giá trị đầu vào | Type Composition, mở rộng type |

## 8. Lỗi thường gặp

**1) Nhầm intersection với "merge 2 object khi runtime":** `&` chỉ có ý nghĩa với **type system**, không sinh code. Nếu muốn gộp giá trị, bạn vẫn phải tự `{ ...o1, ...o2 }` như ở phần 2.

**2) Property trùng tên tạo ra `never`:**

```ts
type Config1 = { mode: 'light' };
type Config2 = { mode: 'dark' };
type Config = Config1 & Config2; // mode: 'light' & 'dark' = never
```

Đây thường là dấu hiệu bạn đang cần **union** hoặc thiết kế lại type.

**3) Dùng `&` khi muốn "gộp tùy chọn":** nếu bạn cần "object có thể có props của A hoặc B", đó là union — không phải intersection.

## 9. Tóm tắt nhanh

- `A & B` = "phải thỏa **cả** A và B" — với object là gộp properties.
- `T1 & T2` trong generic giữ được gợi ý đầy đủ của cả hai (pattern `merge`).
- Property trùng tên khác type → `never`; đó là tín hiệu thiết kế sai, không phải cách "gộp".
- Ứng dụng lớn nhất: **Type Composition** (thư viện UI) và **branded type** (phân biệt các dạng string/id).
- `&` chỉ tác động ở **compile time** — code runtime bạn vẫn tự gộp bằng `{ ...a, ...b }`.

## 10. Intersection trong thực tế: compose type cho component props

Một pattern phổ biến trong codebase React/Vue + TS: tách **props cốt lõi** và **props hành vi** thành các type nhỏ, rồi compose theo nhu cầu:

```ts
type WithDisabled = { disabled?: boolean };
type WithLoading = { loading?: boolean };
type WithSize = { size: 'sm' | 'md' | 'lg' };

type SubmitButtonProps = {
  label: string;
  onClick: () => void;
} & WithDisabled & WithLoading & WithSize;

const props: SubmitButtonProps = {
  label: 'Lưu',
  onClick: () => save(),
  disabled: false,
  loading: true,
  size: 'md',
};
```

Khi yêu cầu thay đổi (thêm size cho Card, thêm loading cho Link...), bạn chỉ cần `&` thêm type có sẵn — không phải sửa lại các type cũ. Đây chính là sức mạnh của **Type Composition**: type nhỏ, dùng một lần, kết hợp nhiều lần.

## 11. Bài tập

1. Tạo type `Admin = User & Permissions` với `User` có `name`, `email`, `Permissions` có `role`, `manageUsers: () => void`. Khởi tạo 1 object hợp lệ và thử bỏ 1 property để xem lỗi.
2. Viết hàm `merge<A, B>(a: A, b: B): A & B` và chứng minh TS gợi ý đủ properties của cả 2 tham số.
3. Dùng branded type tạo `Email = string & { __brand: 'Email' }` và viết hàm `sendEmail(to: Email)` — đảm bảo chỉ string đã qua hàm `asEmail()` mới gọi được.

## 📚 Tài liệu tham khảo

- TypeScript Handbook — Intersection Types: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html
- Creating Types from Types: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html
- Bài liên quan trong series: [7_Union](../7_Union/README.md) • [12_Utility-Types](../12_Utility-Types/README.md) • [13_Mapped-Types](../13_Mapped-Types/README.md)
