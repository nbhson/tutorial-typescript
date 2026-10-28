let mVariable: any = 'Typescript training'; // dang kieu any

// Muon dung cac phuong thuc cua String phai convert ve string
// let total = (<string>mVariable).length  // cach 1 
let total = (mVariable as string).length // cach 2
console.log(total);