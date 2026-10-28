# Decorators — Bộ trang trí cho class

> Decorators cho phép bạn "trang trí" (attach thêm hành vi vào) **class, method, property, accessor** một cách khai báo — nền tảng của các framework lớn như **NestJS**, **TypeORM**, **class-validator**. Từ TypeScript 5.0, cú pháp decorator **chuẩn ECMAScript (Stage 3)** được hỗ trợ chính thức; từ TypeScript 7.0 (compiler Go), mọi thứ vẫn giữ nguyên như 6.0.

## 1. Decorator là gì?

Một decorator là một **hàm nhận vào target và trả về/các chỉnh sửa target**, được viết với ký hiệu `@name` ngay trước class, method, property hoặc parameter:

```ts
// Tên "log" phía trên lớp Logger chính là một decorator
@log
class Calculator {
  add(a: number, b: number) {
    return a + b;
  }
}
```

Nói một cách đơn giản: decorator là cách viết **code chạy khi định nghĩa class** (không phải khi khởi tạo) nhằm:

- ghi log / đo hiệu năng,
- đăng ký route (NestJS: `@Get()`, `@Post()`),
- đánh dấu validate (class-validator: `@IsEmail()`),
- inject dependency, memoize, readonly...

## 2. Hai "thế hệ" decorator — phân biệt rõ!

| | Decorator chuẩn (Stage 3) | Legacy decorator |
|---|---|---|
| Chuẩn hóa | ECMAScript Stage 3 (đang tiến tới standard) | Đề xuất cũ của TS |
| Bật trong tsconfig | Mặc định (không cần flag) — TS 5.0+ | `"experimentalDecorators": true` |
| Tham số nhận vào | `(value, context)` | `(target, name, descriptor)` |
| Ai đang dùng | Code mới từ 2025+ | NestJS, TypeORM, Angular (vẫn dùng legacy) |

```jsonc
// tsconfig.json — TS 6.0/7.0 mặc định KHÔNG bật legacy decorator
{
  "compilerOptions": {
    "experimentalDecorators": false, // mặc định — dùng decorator chuẩn
    "useDefineForClassFields": true
  }
}
```

> Nếu dự án dùng NestJS/TypeORM (vẫn dựa trên decorator legacy + `emitDecoratorMetadata`), bạn giữ `"experimentalDecorators": true` như cũ. Với code mới thuần TS, hãy dùng decorator chuẩn như trong bài này.

## 3. Decorator chuẩn (Stage 3): cấu trúc `(value, context)`

Mỗi decorator nhận 2 tham số: **giá trị được trang trí** và một **context object** chứa thông tin (tên, kind, static/private...):

```ts
function logged<T extends (...args: any[]) => any>(
  originalMethod: T,
  context: ClassMethodDecoratorContext,
) {
  const methodName = String(context.name);

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    console.log(`Goi ${methodName} voi tham so:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`=> ${methodName} tra ve:`, result);
    return result;
  };
}

class Calculator {
  @logged
  add(a: number, b: number) {
    return a + b;
  }
}

new Calculator().add(2, 3);
// Goi add voi tham so: [ 2, 3 ]
// => add tra ve: 5
```

`context.kind` cho biết loại phần tử được trang trí: `'method'`, `'class'`, `'field'`, `'getter'`, `'setter'`, `'accessor'`.

## 4. Các loại decorator

### 4.1. Class decorator

Nhận trực tiếp class, có thể **trả về class mới** (bọc thêm hành vi):

```ts
function injectable<T extends new (...args: any[]) => any>(
  constructor: T,
  context: ClassDecoratorContext,
) {
  // Tra ve mot class mo rong class goc — them thong tin, khong lam mat gi
  return class extends constructor {
    readonly registeredAt = new Date().toISOString();
  };
}

@injectable
class Report {
  title = 'Bao cao thang 10';
}

const r = new Report() as Report & { registeredAt: string };
console.log(r.title, r.registeredAt);
```

Ứng dụng phổ biến: tự động đăng ký class vào một registry (DI container của NestJS chính là làm việc này qua `@Injectable()`).

### 4.2. Method decorator — ví dụ đo thời gian thực thi

```ts
function timed<T extends (...args: any[]) => any>(
  method: T,
  context: ClassMethodDecoratorContext,
) {
  const name = String(context.name);

  return function (this: unknown, ...args: Parameters<T>) {
    const start = performance.now();
    const result = (method as (...rest: unknown[]) => ReturnType<T>).apply(this, args);
    console.log(`${name} mat ${Date.now() - start}ms`);
    return result;
  } as unknown as T;
}

class Report {
  @timed
  generate() {
    // ... xu ly nang
    return 'done';
  }
}
```

### 4.3. Field (property) decorator

Chạy khi **khởi tạo instance**, nhận giá trị khởi tạo ban đầu:

```ts
function maxLength(max: number) {
  return function (_value: undefined, context: ClassFieldDecoratorContext) {
    if (context.kind !== 'field') return;

    return function (this: { [key: string]: string }, initialValue: string) {
      if (initialValue.length > max) {
        throw new Error(`${String(context.name)} toi da ${max} ky tu`);
      }
      return initialValue;
    };
  };
}

class Post {
  @maxLength(600)
  description = 'Mo ta khoa hoc';
}

const p = new Post();
console.log(p.description); // 'Mo ta khoa hoc'
// const bad = new (class { @maxLength(2) description = 'qua dai ne' })(); // ❌ throw khi chạy
```

### 4.4. Accessor decorator

Áp dụng cho `accessor` property (getter/setter tự động):

```ts
function logged(value: unknown, context: ClassAccessorDecoratorContext) {
  return {
    get() {
      console.log(`Doc ${String(context.name)}`);
      return value;
    },
    set(v: unknown) {
      console.log(`Gan ${String(context.name)}`);
      value = v;
    },
  };
}

class Account {
  @logged accessor balance = 0;
}

const acc = new Account();
acc.balance = 500; // log: Gan balance
console.log(acc.balance); // log: Doc balance → 500
```

## 5. Decorator Factory — decorator "có tham số"

Decorator cần cấu hình (như `@maxLength(600)`) là một **hàm trả về decorator**:

```ts
function throttle(ms: number) {
  return function <T extends (...args: any[]) => any>(method: T, context: ClassMethodDecoratorContext): T {
    let lastRun = 0;

    return function (this: unknown, ...args: Parameters<T>) {
      const now = Date.now();
      if (now - lastRun < ms) return; // bo qua cac lan goi gan nhau
      lastRun = now;
      return (method as (...rest: unknown[]) => void).apply(this, args);
    } as unknown as T;
  };
}

class SearchBox {
  @throttle(300)
  onInput(query: string) {
    console.log('Tim kiem:', query);
  }
}
```

Thứ bậc: `@factory(args)` → trả về decorator thật → decorator thật nhận `(value, context)`.

## 6. Nhiều decorator trên một mục tiêu

Decorators được áp dụng **từ dưới lên trên** (giống toán học: f∘g chạy g trước):

```ts
class Order {
  @logged
  @readonlyProp
  id = 1;
}
```

## 7. Decorator Metadata (TS 5.2+)

Decorator có thể đính kèm **metadata** vào class qua `Symbol.metadata`, thay cho cách `Reflect.metadata` cũ:

```ts
class User {
  @metadata({ role: 'admin' })
  name = 'John';
}

// Bên ngoài đọc metadata:
// User[Symbol.metadata].name = { role: 'admin' }
```

Metadata thường được dùng để **đánh dấu validate/serialize** rồi một hệ thống khác đọc ra lúc runtime — chính là cách class-validator hoạt động.

## 8. Trong hệ sinh thái thực tế

- **NestJS** — DI và routing hoàn toàn bằng decorator:
  ```ts
  @Controller('courses')
  class CoursesController {
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
      return this.coursesService.findBySlug(slug);
    }
  }
  ```
- **TypeORM / MikroORM** — `@Entity()`, `@Column()`, `@ManyToOne()`...
- **class-validator** — `@IsEmail()`, `@MinLength(6)`.

> Ở thời điểm 10/2026, NestJS và TypeORM vẫn dùng **decorator legacy** (`experimentalDecorators: true`). Đây là lý do pattern decorator "kiểu cũ" vẫn phổ biến dù cú pháp chuẩn đã có — khi đọc code NestJS bạn sẽ thấy cả hai cú pháp rất giống nhau về tư duy.

## 9. So sánh decorator chuẩn vs legacy

| Tiêu chí | Chuẩn (Stage 3) | Legacy (`experimentalDecorators`) |
|---|---|---|
| Config | Mặc định bật từ TS 5.0 | Cần flag + thường kèm `emitDecoratorMetadata` |
| Tham số | `(value, context)` | `(target, key, descriptor)` |
| Class decorator có thể thay class | ✅ | ✅ |
| Property decorator (field) | Chạy lúc khởi tạo, có accessor | Chỉ đánh dấu, thường dùng kèm metadata |
| Tiêu chuẩn ECMAScript | Stage 3 | Bị loại khỏi đề xuất |

## 10. Bài tập

1. Viết decorator `@log` cho class: mọi method gọi đều in ra tên method và thời gian thực thi.
2. Viết `@minLength(n)` cho field, throw lỗi khi vi phạm (dùng `ClassFieldDecoratorContext`).
3. Dùng decorator + metadata đánh dấu các field "bắt buộc" của một class `UserForm`, rồi viết hàm `validate(obj)` đọc metadata và trả về danh sách lỗi.

## 📚 Tài liệu tham khảo

- TypeScript Handbook — Decorators: https://www.typescriptlang.org/docs/handbook/decorators.html
- TC39 Decorators proposal (Stage 3): https://github.com/tc39/proposal-decorators
- Announcing TypeScript 5.0 (decorator chuẩn): https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/
- NestJS — Decorators: https://docs.nestjs.com/custom-decorators
- Bài liên quan trong series: [10_class](../10_class/) • [12_Utility-Types](../3_data-type/12_Utility-Types/README.md)
