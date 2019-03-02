import "Polyfill"

// Function to get image from URL
export function getImage(url, noCache=false) {
    return new Promise((resolve, reject) => {
        try {
            if (!url.startsWith("chrome://")) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if (this.readyState == 4 && this.status == 200) {
                        var contentType = xhr.getResponseHeader("Content-Type").trim();
                        if (contentType.startsWith("image/")) {
                            var flag = "data:" + contentType + ";charset=utf-8;base64,";
                            var imageStr = arrayBufferToBase64(xhr.response);
                            resolve(flag + imageStr);
                        } else {
                            reject("Image Request Failed: Content-Type is not an image! (Content-Type: \"" + contentType + "\")");
                        }
                    }
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url, true);
                if (noCache) { xhr.setRequestHeader("Cache-Control", "no-store"); }
                xhr.send();
            } else {
                resolve();
            }
        } catch (err) {
            reject(err.message);
        }
    });
}

// Function to transform ArrayBuffer into a Base64 String
export function arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
}
