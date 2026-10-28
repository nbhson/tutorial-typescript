/**
 * # Union
 *    cho phep su dung nhieu hon 1 kieu du lieu
 *    cho mot bien hoac 1 tham so ham
 */
/** Variable */
var code;
code = 1;
code = "string";
/** Function */
function displayType(code) {
    if (typeof code === "number")
        console.log("Code is number.");
    else if (typeof code === "string")
        console.log("Code is string.");
}
displayType(123); // Output: Code is number.
displayType("ABC"); // Output: Code is string.
// displayType(true); //Compiler Error: Argument of type 'true' is not assignable to a parameter of type string | number
