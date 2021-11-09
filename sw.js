const CACHE_NAME = 'ClientWorkerCache';
let cachelist = [
    //"/"
]


const interceptdomain = [
    "smoe.cc"
]


const proxylist = [
    "81.71.127.42"
]



self.addEventListener('install', function (installEvent) {
    self.skipWaiting();
    installEvent.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(cachelist))
    );
});


self.addEventListener('fetch', event => {
    try {
        event.respondWith(handle(event.request))
    }
    catch (msg) {
        event.respondWith(handleerr(event.request, msg))
    }
});


const handleerr = async (req, msg) => {
    return new Response(`<h1>ClientWorker用户端错误</h1>
    <b>${msg}</b>`, { headers: { "content-type": "text/html; charset=utf-8" } })
}


const handle = async (req) => {
    const urlStr   = req.url
    const urlObj   = new URL(urlStr)
    const pathname = urlObj.href.substr(urlObj.origin.length)
    const domain   = (urlStr.split('/'))[2]
    let path       = pathname.split('?')[0]
    if (interceptdomain.indexOf(domain) !== -1) {
        return custom(req)
    } else {
        return fetch(req)
    }

}


const custom = async (req) => {
    const requestClone = req.clone();
    const urlStr   = req.url
    const urlObj   = new URL(urlStr)
    const pathname = urlObj.href.substr(urlObj.origin.length)
    const domain   = (urlStr.split('/'))[2]
    let path       = pathname.split('?')[0]
    let n          = ""
    for (var i in proxylist) {
        try {
            n = await fetch(`https://${proxylist[i]}${path}${urlObj.search}`, {
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                    
                },
                body: req.body,
                method: req.method,
                //cookies: req.cookies
                mode: "cors",
                referrer: req.referrer,
                referrerPolicy :req.referrerPolicy,
                credentials: "omit",//从不发送cookies.
                //cache: req.cache,
                //status: req.status,
                //statusText: req.statusText,
                redirect: "follow"
            });
            break;
        } catch (p) {
            continue;
        }
    }

    
    if (n.status >= 400 || n === "") {
        return new Response(`<!DOCTYPE html><html lang="zh-CN" class=""><head><title>晓梦  | 页面没找到</title><link rel="stylesheet" href="/usr/themes/Diaspora-Typecho-master/assets/css/Diaspora.css"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta charset="UTF-8"><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="google" content="notranslate" /><head><div id="single" class="page"><div id="top"><a class="image-icon" href="javascript:history.back()"></a></div><div class="section">	<div class="images">	</div><div class="article"><div><div class="content"><h1>404 Not Found</h1><p>The page you were looking for is no longer available.</p></div></div></div></div></div></body></html>`, { headers: { "content-type": "text/html; charset=utf-8" } })
    }
    else {
        return n
    }
}
