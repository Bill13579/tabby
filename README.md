# What is it?

Tabby is an open-source window & tab manager that can manage great amounts of windows and tabs at ease.

This is the development branch for Tabby v2.0.

You can install Tabby on it's Firefox Add-on page: https://addons.mozilla.org/en-US/firefox/addon/tabby-window-tab-manager/
Or, to install the newest development version, see the [Installing the dev build](#installing-the-dev-build) section.

# Installing the dev build

#### Prerequisites
- Git
- Node.js
- Firefox >= 59 (recommended)

#### Building Tabby
1. Open a git enabled shell of your choice (e.g. Command Prompt, Git Bash)
2. Get the source code  
`git clone https://github.com/Bill13579/tabby.git`
3. Go into the Tabby directory  
`cd tabby`
4. Switch to the `v2.0-dev` branch  
`git checkout v2.0-dev`
5. Install dependencies with npm  
`npm install`
6. Build Tabby
`npm run build`

#### Installation
1. Start Firefox
2. Go to `about:debugging`
3. Press on the `Load Temporary Add-on...` button
4. Select the `manifest.json` file in the `dist` directory

# File Structure

icons/ - Directory for storing Tabby icons<br/>
icons/tabby.svg - Tabby icon (Vector)<br/>
icons/tabby.png - Tabby icon (Raster)<br/>

release/ - Release zip files<br/>

screenshots/ - Screenshots<br/>
screenshots-archive/ - Old screenshots of old releases<br/>

src/ - Source code directory<br/>

src/webext/ - Firefox source code directory<br/>
src/webext/content/ - Tabby content scripts<br/>
src/webext/icons/ - Icons used in the Tabby UI<br/>
src/webext/popup/ - Tabby popup scripts<br/>
src/webext/popup/index.html - Tabby popup main html file<br/>
src/webext/popup/popup.css - Tabby popup main css file<br/>
src/webext/popup/popup.js - Tabby popup main javascript file<br/>
src/webext/background.js - Tabby background script<br/>
src/webext/manifest.json - Web extension manifest file<br/>

src/chrome/ - Chrome source code directory<br/>
src/chrome/content/ - Tabby content scripts<br/>
src/chrome/icons/ - Icons used in the Tabby UI<br/>
src/chrome/popup/ - Tabby popup scripts<br/>
src/chrome/popup/index.html - Tabby popup main html file<br/>
src/chrome/popup/popup.css - Tabby popup main css file<br/>
src/chrome/popup/popup.js - Tabby popup main javascript file<br/>
src/chrome/background.js - Tabby background script<br/>
src/chrome/manifest.json - Web extension manifest file<br/>

LICENSE - License file<br/>
README.md - README file
