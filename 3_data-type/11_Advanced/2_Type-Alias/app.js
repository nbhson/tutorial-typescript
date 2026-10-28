"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// string thi string het, number thi number het
var a = {
    foo: '10',
    bar: '10'
};
var b = "a";
var c = "c";
var d = 10;
// Readonly<T> lam tat ca cac props trong type thanh readonly. Eg: Rat co loi khi dung cho Redux State.
var e = {
    firstName: 'Son',
    lastName: 'Nguyen'
};
// Required<T> lam tat ca cac props trong type thanh bat buoc
var f = {
    firstName: 'Son',
    lastName: 'Nguyen',
    age: 20
};
// type Partial<T> lam tat ca cac props trong type thanh optional
var j = {};
function aaa() {
    return 1;
}
console.log(typeof aaa);
