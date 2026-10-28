# Utility Types

> TypeScript cung cấp sẵn hơn 20 utility types tích hợp trong ngôn ngữ, nằm trong namespace `TypeScript`. Đây là những type generic có sẵn, giúp biến đổi (transform) kiểu dữ liệu một cách linh hoạt.

Tất cả utility types đều là **Conditional Type** hoặc **Mapped Type** (hoặc kết hợp cả hai). Các ví dụ bên dưới cũng là cách implement từng type bằng generic type thuần.

## `Partial<T>` - Làm tất cả thuộc tính thành optional

```ts
// Định nghĩa gốc
interface User {
  name: string;
  age: number;
  email: string;
}

// Partial: tất cả fields đều optional - rất hữu ích cho update/patch
function updateUser(userId: number, changes: Partial<User>) {
  // Ví dụ: gửi API PATCH chỉ cần truyền trường muốn thay đổi
  console.log(`Cập nhật user ${userId}:`, changes);
}

updateUser(1, { name: 'Sơn' });       // ✅ chỉ cần name
updateUser(1, { age: 25, email: 'x' }); // ✅ nhiều trường
// updateUser(1, {});                  // ✅ cũng hợp lệ
// updateUser(1, { invalid: 'x' });   // ❌ Error - không có property này
```

```ts
// Cách tự implement
type Partial<T> = { [P in keyof T]?: T[P] };
```

## `Required<T>` - Ngược lại của Partial: bắt buộc tất cả thuộc tính

```ts
interface Config {
  host?: string;
  port?: number;
  debug?: boolean;
}

function startServer(config: Required<Config>) {
  // Bây giờ tất cả đều bắt buộc - phải truyền đủ
  console.log(`Server at ${config.host}:${config.port}, debug=${config.debug}`);
}

// startServer({}); // ❌ Error: Property 'host' is missing
startServer({ host: 'localhost', port: 3000, debug: true }); // ✅
```

```ts
type Required<T> = { [P in keyof T]-?: T[P] }; // -? xóa ? modifier
```

## `Readonly<T>` - Làm tất cả thuộc tính thành không thể thay đổi

```ts
interface AppConfig {
  version: string;
  apiUrl: string;
}

const config: Readonly<AppConfig> = {
  version: '1.0.0',
  apiUrl: 'https://api.example.com',
};

// config.version = '2.0.0'; // ❌ Error: Cannot assign to 'version' because it is a read-only property
```

```ts
type Readonly<T> = { readonly [P in keyof T]: T[P] };
```

> Kết hợp `Readonly` với `as const` object: nếu `Readonly<T>` làm properties readonly thì `as const` còn làm cả nested object thành readonly (rộng hơn).

## `Pick<T, K>` - Chọn (trích xuất) một số thuộc tính cụ thể

```ts
interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  publishedAt: Date;
  tags: string[];
}

// Chỉ lấy id + title cho danh sách hiển thị
type ArticlePreview = Pick<Article, 'id' | 'title'>;
// { id: number; title: string }

// Dùng khi component chỉ cần một phần dữ liệu
function renderCard(preview: ArticlePreview) { /* ... */ }
```

```ts
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
```

## `Omit<T, K>` - Loại bỏ một số thuộc tính

```ts
// Loại bỏ password khi trả về từ API
interface User {
  id: number;
  username: string;
  email: string;
  password: string;      // ⚠️ không nên expose ra client
  createdAt: Date;
}

type PublicUser = Omit<User, 'password'>;
// { id: number; username: string; email: string; createdAt: Date }
```

```ts
// Omit implement bằng Pick + Exclude
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

## `Record<K, T>` - Tạo object type với keys và value type cho trước

```ts
// Tạo object với 3 keys cố định, mỗi value là string
type PageStatus = 'home' | 'about' | 'contact';
type PageConfig = Record<PageStatus, { title: string; component: string }>;

const pages: PageConfig = {
  home:     { title: 'Trang chủ', component: 'HomePage' },
  about:    { title: 'Giới thiệu', component: 'AboutPage' },
  contact:  { title: 'Liên hệ', component: 'ContactPage' },
};
// pages.home; // ✅
```

```ts
type Record<K extends keyof any, T> = { [P in K]: T };
```

> **Khác biệt `Pick`/`Omit` vs `Record`:** `Pick`/`Omit` chọn/lọc từ một type có sẵn; `Record` xây dựng object type từ danh sách keys và value type.

## `Exclude<T, U>` - Loại bỏ types từ T nếu gán được cho U

```ts
type AllEvents = 'click' | 'focus' | 'blur' | 'keydown' | 'keyup';

// Loại bỏ những event liên quan đến keyboard
type MouseEvents = Exclude<AllEvents, 'keydown' | 'keyup'>;
// 'click' | 'focus' | 'blur'
```

## `Extract<T, U>` - Giữ lại types từ T chỉ khi gán được cho U

```ts
type AllEvents = 'click' | 'focus' | 'blur' | 'keydown' | 'keyup';

// Chỉ giữ keyboard events
type KeyboardEvents = Extract<AllEvents, 'keydown' | 'keyup' | 'keypress'>;
// 'keydown' | 'keyup' (keypress không có trong AllEvents nên bị loại)
```

```ts
// Implement
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
```

## `NonNullable<T>` - Loại bỏ `null` và `undefined` khỏi T

```ts
type MaybeString = string | null | undefined;
type CleanString = NonNullable<MaybeString>; // string

function greet(name: NonNullable<string | null>) {
  // name không thể null - TS tự suy ra là string
  console.log(`Xin chào, ${name.toUpperCase()}`);
}
```

```ts
type NonNullable<T> = T extends null | undefined ? never : T;
```

## `ReturnType<T>` - Lấy kiểu trả về của một function

```ts
async function fetchUser(): Promise<{ id: number; name: string }> {
  return { id: 1, name: 'Sơn' };
}

type FetchedUser = ReturnType<typeof fetchUser>;
// Promise<{ id: number; name: string }>

// Nếu muốn unwrap luôn Promise, kết hợp với Awaited
type Data = Awaited<ReturnType<typeof fetchUser>>;
// { id: number; name: string }
```

```ts
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

## `Parameters<T>` - Lấy kiểu tuple của tham số function

```ts
function updateUser(id: number, changes: { name: string; age: number }, dryRun: boolean) {}

// Lấy kiểu tuple tham số
type UpdateUserParams = Parameters<typeof updateUser>;
// [id: number, changes: { name: string; age: number }, dryRun: boolean]

// Tạo một hàm mới với cùng tham số
function logUpdate(...args: Parameters<typeof updateUser>) {
  console.log('Calling update with:', args);
}

// Pick/omit từng tham số
type ChangesArg = Parameters<typeof updateUser>[1];
// { name: string; age: number }
```

```ts
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

## `ConstructorParameters<T>` - Lấy tham số của constructor/class

```ts
class UserService {
  constructor(baseUrl: string, timeout: number = 5000) {}
}

type ServiceConfig = ConstructorParameters<typeof UserService>;
// [baseUrl: string, timeout?: number]

const config: ServiceConfig = ['https://api.example.com', 3000];
// Dùng để tạo instance hoặc mock
```

## `InstanceType<T>` - Lấy instance type của một class

```ts
class Animal {
  name: string;
}

type AnimalInstance = InstanceType<typeof Animal>; // Animal
```

## `ThisParameterType` và `OmitThisParameter`

```ts
function getName(this: { name: string }, prefix: string): string {
  return `${prefix} ${this.name}`;
}

type ThisType = ThisParameterType<typeof getName>; // { name: string }
type ReturnFn = OmitThisParameter<typeof getName>; // (prefix: string) => string
```

## Tổng hợp ví dụ thực tế: CRUD operation types

```ts
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

// Create: bỏ id (tự sinh)
type CreateUserInput = Omit<User, 'id'>;
// { name: string; email: string; role: 'admin' | 'editor' | 'viewer' }

// Update: tất cả optional (PATCH)
type UpdateUserInput = Partial<Omit<User, 'id'>>;

// Read: chỉ lấy id + name (list view)
type UserSummary = Pick<User, 'id' | 'name'>;

// Delete: chỉ cần id
type DeleteUserInput = Pick<User, 'id'>;
```

## Tổng kết utility types chính

| Utility Type | Mô tả | Phiên bản |
|---|---|---|
| `Partial<T>` | Tất cả optional | Từ đầu |
| `Required<T>` | Bắt buộc tất cả | Từ đầu |
| `Readonly<T>` | Không thể thay đổi | Từ đầu |
| `Pick<T, K>` | Chọn vài fields | Từ đầu |
| `Omit<T, K>` | Loại bỏ vài fields | Từ đầu |
| `Record<K, T>` | Tạo object từ keys + value | Từ đầu |
| `Exclude<T, U>` | Loại bỏ type | Từ đầu |
| `Extract<T, U>` | Giữ lại type khớp | Từ đầu |
| `NonNullable<T>` | Loại null/undefined | Từ đầu |
| `ReturnType<T>` | Lấy return type | Từ đầu |
| `Parameters<T>` | Lấy parameter tuple | Từ đầu |
| `ConstructorParameters<T>` | Lấy constructor params | Từ đầu |
| `InstanceType<T>` | Lấy instance type của class | Từ đầu |
| `NoInfer<T>` | Chặn tự động infer | **TS 5.4+** |

> **NoInfer\<T\>** (TypeScript 5.4+): Đặt vào generic để ngăn TS tự động suy luận (infer) kiểu tại vị trí đó. Rất hữu ích để tránh circular inference.

## Tài liệu tham khảo

- [Utility Types - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Mapped Types - TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
