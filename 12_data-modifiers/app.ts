/**
 * # Public
 *    Tat ca cac thanh phan trong class mac dinh deu la public
 *    Co the duoc truy cap o bat cu dau ma khong co bat ky han che nao.
 */

class Employee {
  public empCode: number;
  empName: string;
}

let emp = new Employee();
emp.empCode = 123;
emp.empName = "Swati";

/**
 * # Private
 *   Chi hien thi doi voi lop do va khong the truy cap duoc ben ngoai lop chua
 */
class Employee2 {
  private empCode: number;
  empName: string;
}

let emp2 = new Employee2();
// emp2.empCode = 123; // Compiler Error
emp2.empName = "Swati"; //OK

/**
 * # Protected
 */
class Employee3 {
  public empName: string;
  protected empCode: number;

  constructor(name: string, code: number) {
    this.empName = name;
    this.empCode = code;
  }
}

class SalesEmployee extends Employee3 {
  private department: string;

  constructor(department: string, name: string, code: number) {
    super(name, code);
    this.department = department;
  }

  getCode() {
    return this.empCode; // nhu private nhung co the truy cap o lop con | private thi chi trong lop cua no
  }
  getDepartment() {
    return this.department;
  }
}
let emp3 = new SalesEmployee("Sales", "John Smith", 123);
console.log(emp3.empName);
console.log(emp3.getCode());
console.log(emp3.getDepartment());
