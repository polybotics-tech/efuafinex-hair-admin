export const format_number = (number) => {
  if (isNaN(number)) {
    return 0;
  }

  //proceed with function
  var parts = (number + "").split("."),
    main = parts[0],
    len = main.length,
    output = "",
    first = main.charAt(0),
    i;

  if (first === "-") {
    main = main.slice(1);
    len = main.length;
  } else {
    first = "";
  }
  i = len - 1;
  while (i >= 0) {
    output = main.charAt(i) + output;
    if ((len - i) % 3 === 0 && i > 0) {
      output = "," + output;
    }
    --i;
  }
  // put sign back
  output = first + output;
  // put decimal part back
  if (parts.length > 1) {
    output += "." + parts[1];
  }

  return output;
};

export const format_input_number = (number) => {
  let res = number.toString().replace(/[^0-9]/g, "");
  return res;
};
