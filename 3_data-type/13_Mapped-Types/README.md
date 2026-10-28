# Mapped Types

> Mapped Types là cách tạo kiểu mới bằng cách **duyệt qua** tất cả keys của một kiểu đã có và biến đổi (transform) từng key-value một cách có quy tắc.

Mapped Types là nền tảng của hầu hết utility types (`Partial`, `Readonly`, `Pick`, `Omit`...) và kết hợp tuyệt vời với **Conditional Types** và **Template Literal Types**.

## Cú pháp cơ bản

```ts
// [P in K]: duyệt qua từng key P trong tập keys K
type { [P in K]: T[P] }
```

```ts
// Ví dụ đơn giản: đảo tên tất cả properties thành tiếng Việt
interface Product {
  id: number;
  name: string;
  price: number;
}

// Mapped qua Product - chỉ định nghĩa lại value type
type MappedProduct = { [P in keyof Product]: string | number };
// { id: number | string; name: number | string; price: number | string }
// (hơi vô nghĩa, nhưng minh họa cú pháp)
```

## `keyof` - Lấy danh sách keys

```ts
// keyof T: trả về union tất cả keys của T
type Keys = keyof Product; // 'id' | 'name' | 'price'

// keyof với index signature
type ArrayMethods = keyof any[]; // number | typeof push | typeof pop | ... (rất dài)
```

## Biến đổi value types

```ts
// Chuyển tất cả value thành string (optional keys giữ nguyên)
type Stringify<T> = { [P in keyof T]: string };
type AllStrings = Stringify<Product>;
// { id: string; name: string; price: string }
```

## Modifiers trong Mapped Types

Có 2 modifiers: `?` (optional) và `readonly`:

```ts
// Loại bỏ ? modifier (biến optional thành bắt buộc)  
type Required<T> = { [P in keyof T]-?: T[P] };

// Loại bỏ readonly modifier
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

// Thêm ? modifier (biến bắt buộc thành optional)
type Optional<T> = { [P in keyof T]?: T[P] }; // giống Partial

// Thêm readonly modifier
type Frozen<T> = { readonly [P in keyof T]: T[P] }; // giống Readonly
```

Dùng dấu `-` để loại bỏ modifier, `+` để thêm (hoặc để mặc định):

```ts
type ExactlyOptional<T> = { [P in keyof T]+?: T[P] }; // thêm ?
type ExactlyRequired<T> = { [P in keyof T]-?: T[P] }; // bỏ ?
```

## Filter keys với conditional trong mapped type

Dùng `[P in K as FilterLogic]` để lọc keys:

```ts
// Chỉ giữ những fields có giá trị là string
type StringifyValues<T> = {
  [P in keyof T as T[P] extends string ? P : never]: T[P];
};

interface Mixed {
  name: string;
  age: number;
  active: boolean;
}

type OnlyStringValues = StringifyValues<Mixed>;
// { name: string }
// age (number) và active (boolean) bị loại vì never
```

## Template Literal Types trong Mapped Types

**Template Literal Types** (TypeScript 4.1+) dùng để tạo keys mới từ keys cũ:

```ts
// Thêm prefix cho tất cả keys
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface User {
  name: string;
  age: number;
}

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

### Xóa prefix/suffix từ keys

```ts
// Giả sử có API trả về keys dạng snake_case
interface ApiResponse {
  user_id: number;
  user_name: string;
  created_at: string;
}

// Chuyển snake_case -> camelCase
type CamelCase<S extends string> = // implementation dùng recursive conditional
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<Tail>}`
    : S;

type CamelCaseKeys<T> = {
  [P in keyof T as CamelCase<string & P>]: T[P];
};

type Transformed = CamelCaseKeys<ApiResponse>;
// { userId: number; userName: string; createdAt: string }
```

### Map object sang union of keys với mapped type

```ts
type RouteConfig = {
  home: { path: '/'; auth: false };
  admin: { path: '/admin'; auth: true };
  profile: { path: '/profile'; auth: true };
};

type RoutePaths = { [P in keyof RouteConfig]: RouteConfig[P]['path'] }[keyof RouteConfig];
// '/home' | '/admin' | '/profile'
```

## Mapped Types với indexed access qua `as`

```ts
// Map: chuyển tất cả keys thành dạng snake_case
type SnakeCase<T> = {
  [P in keyof T as SnakeCaseString<P>]: T[P];
};
```

## Kết hợp: Mapped + Conditional + infer

```ts
// Unwrap Promise trong value, giữ keys nguyên
type DeepAwaited<T> = {
  [P in keyof T]: T[P] extends Promise<infer U> ? U : T[P];
};

interface LazyUser {
  id: number;
  name: string;
  data: Promise<{ score: number }>;
}

type EagerUser = DeepAwaited<LazyUser>;
// {
//   id: number;
//   name: string;
//   data: { score: number };  // Promise đã bị unwrap
// }
```

## Homomorphic Mapped Types (mapped type đồng cấu)

Mapped type **homomorphic** bảo toàn `readonly` và `?` modifiers từ kiểu gốc:

```ts
// Homomorphic: tự động giữ modifiers của T
type AddPrefix<T> = { [P in keyof T as `prefix_${string & P}`]: T[P] };

interface A { readonly x?: number }
type B = AddPrefix<A>; // { readonly prefix_x?: number } ✅ giữ nguyên readonly và ?

// Non-homomorphic: không bảo toàn modifiers
type C = { [P in keyof A]: A[P] }; // { readonly x?: number } ✅ cũng giữ
```

Điểm khác biệt rõ nhất với conditional mapped type dùng `as`:

```ts
type FilterOptional<T> = { [P in keyof T as {} extends Record<P, T[P]> ? P : never]: T[P] };
// {} extends Record<P, T[P]> kiểm tra P có optional không
type OnlyRequired = FilterOptional<{ x?: number; y: number }>;
// { y: number } - chỉ giữ required fields
```

## Mapped Types trong thực tế: Type-safe event emitter

```ts
type EventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  resize: UIEvent;
};

type EventHandlerMap<T extends Record<string, unknown>> = {
  [P in keyof T]: (event: T[P]) => void;
};

type Handlers = EventHandlerMap<EventMap>;
// {
//   click: (event: MouseEvent) => void;
//   keydown: (event: KeyboardEvent) => void;
//   resize: (event: UIEvent) => void;
// }

const handlers: Handlers = {
  click(e) { console.log(e.clientX); },  // e: MouseEvent ✅
  keydown(e) { console.log(e.key); },   // e: KeyboardEvent ✅
  resize(e) { console.log(e.type); },   // e: UIEvent ✅
};
```

## Tổng kết

| Khái niệm | Cú pháp | Mô tả |
|---|---|---|
| `keyof T` | `keyof T` | Union tất cả keys của T |
| Basic mapped | `[P in keyof T]: T[P]` | Duyệt và biến đổi từng key |
| Modifier `-?` | `[P in keyof T]-?: ...` | Loại bỏ optional |
| Modifier `-readonly` | `[-readonly P in keyof T]: ...` | Loại bỏ readonly |
| Filter với `as` | `[P in keyof T as FilterExpr]: ...` | Lọc keys bằng conditional |
| Template literal key | `[P in keyof T as \`prefix${P}\`]: ...` | Tạo keys mới từ template |
| Homomorphic | mapped type thuần | Bảo toàn modifiers |

## Tài liệu tham khảo

- [Mapped Types - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Template Literal Types - TypeScript 4.1](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Key remapping in Mapped Types - TypeScript 4.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)
