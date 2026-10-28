class Circle {
  static pi = 3.14;

  static calculateArea(radius: number) {
    return this.pi * radius * radius;
  }

  calculateCircumference(radius: number): number {
    return 2 * Circle.pi * radius;
  }
}
console.log(Circle.pi); // 3.14
console.log(Circle.calculateArea(5)); // returns 78.5

// neu new object moi thi khong goi duoc nhung thuoc tinh va phuong thuc co static
let circleObj = new Circle();
circleObj.calculateCircumference(5); // returns 31.4000000
// circleObj.calculateArea(); <-- cannot call this
