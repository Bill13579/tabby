if (process.argv.length < 3) {
    console.log("Insufficient number of arguments!");
}
const fs = require("fs");
const path = require("path");
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, "src", "manifest.json"), "utf8").toString())
const Ext = require("./ext-info");
let indent = undefined;
if (process.argv.length === 4 && process.argv[3] === "--pretty") indent = 4;
switch (process.argv[2]) {
    case "webext":
    case "firefox":
        manifest.browser_specific_settings = {
            gecko: {
                id: "tabby@whatsyouridea.com",
                strict_min_version: "59.0"
            }
        };
        manifest.permissions.push("contextualIdentities");
        manifest.host_permissions.push("<all_urls>");
        break;
    case "chrome":
        // Remove suggested keys for last-used-window, since only 4 are allowed.
        manifest.commands["last-used-window"]["suggested_key"] = undefined;
        break;
}
manifest.version = Ext.EXT_VERSION;
fs.writeFileSync(path.join(__dirname, "dist", "manifest.json"), JSON.stringify(manifest, undefined, indent));
