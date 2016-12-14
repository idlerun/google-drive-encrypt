'use strict'
const map = new Map

self.onmessage = event => {
    let uniqLink = self.registration.scope + 'intercept-me-nr' + Math.random();
    let port = event.ports[0];

    let p = new Promise((resolve, reject) => {
      let stream = createStream(resolve, reject, port)
      map.set(uniqLink, [stream, event.data])
      port.postMessage({download: uniqLink})
      port.postMessage({debug: 'Mocking a download request'})
    });
    if ('waitUntil' in event) {
        event.waitUntil(p)
    }
}

function createStream(resolve, reject, port){
    var bytesWritten = 0
    return new ReadableStream({
    start(controller) {
      port.onmessage = ({data}) => {
        if (data === 'end') {
          resolve()
          return controller.close()
        }

        if (data === 'abort') {
          resolve()
          controller.error('Aborted the download')
          return
        }

        controller.enqueue(data)
        bytesWritten += data.byteLength
        port.postMessage({ bytesWritten })
      }
    },
    cancel() {
      //console.log("user aborted")
    }
  })
}


self.onfetch = event => {
  let url = event.request.url
  let hijacke = map.get(url)
  let listener, filename, headers

  //console.log("Handling ", url)
  if(!hijacke) return null
  let [stream, data] = hijacke

  map.delete(url)

  filename = typeof data === 'string' ? data : data.filename

  // Make filename RFC5987 compatible
  filename = encodeURIComponent(filename)
    .replace(/['()]/g, escape)
    .replace(/\*/g, '%2A')

  headers = {
    'Content-Type': 'application/octet-stream; charset=utf-8',
    'Content-Disposition': "attachment; filename*=UTF-8''" + filename
  }

  if(data.size) headers['Content-Length'] = data.size

  event.respondWith(new Response(stream, { headers }))
}