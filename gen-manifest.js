if (process.argv.length < 3) {
    console.log("Insufficient number of arguments!");
}
const fs = require("fs");
const path = require("path");
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "src", "manifest.json"), "utf8").toString())
let indent = undefined;
if (process.argv.length === 4 && process.argv[3] === "--pretty") indent = 4;
switch (process.argv[2]) {
    case "webext":
    case "firefox":
        manifest.applications = {
            gecko: {
                id: "tabby@whatsyouridea.com",
                strict_min_version: "59.0"
            }
        };
        break;
    case "chrome":
        break;
}
fs.writeFileSync(path.join(__dirname, "dist", "manifest.json"), JSON.stringify(manifest, undefined, indent));
