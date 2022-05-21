"use strict";

var fetch = require("node-fetch");


// ************************************


main().catch(() => 1);


// ************************************

async function main() {
	// TODO
  try {
    let res = await fetch("http://localhost:8039/get-records");
    if (res && res.ok) {
      let records = await res.json();
      //console.table(records);
      process.exitCode = 0;
      return;
    }
  }
  catch (err) {}
  process.exitCode = 1;
}
