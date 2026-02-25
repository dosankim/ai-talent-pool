const phone = "01041635713";
let formattedPhone = phone.replace(/[^0-9+]/g, "");
if (formattedPhone.startsWith("0")) {
    formattedPhone = "+82" + formattedPhone.substring(1);
} else if (formattedPhone.startsWith("82")) {
    formattedPhone = "+" + formattedPhone;
} else if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+82" + formattedPhone;
}
console.log(formattedPhone);
