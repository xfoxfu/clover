"use strict";

import { encode } from "../lib/jwt";
import { prompt } from "inquirer";

/*
console.log(process.argv);
encode(JSON.parse(process.argv[2]))
  .then(console.log)
  .catch(console.error);
*/
prompt([
  {
    name: "email",
    message: "New User's Email",
  }, {
    name: "note",
    message: "New User's Note",
  },
]).then(async (result) => await encode({
  email: result.email,
  note: result.note,
}))
  .then(console.log)
  .catch(console.error);
