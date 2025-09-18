import { connect } from 'cloudflare:sockets';
const d = new TextDecoder(), e = new TextEncoder(), i = 'token', u = 'uuid', p = ['1.1.1.1'], r = 'ip', n = '狂暴';
const U = ((h, a = new Uint8Array(16)) => { for (let i = 0; i < 32; i += 2) a[i >> 1] = parseInt(h.substr(i, 2), 16); return a })(u.replace(/-/g, ''));
const c = b => { for (let i = 0; i < 16; i++) if (b[i] !== U[i]) return 0; return 1 };
const t = async (h, o, a) => {
  try {
    const s = await connect({ hostname: h, port: o });
    return await s.opened, { tcpSocket: s, initialData: a };
  } catch {}
  if (r) {
    const [H, P] = r.split(':');
    return t(H, +P || o, a);
  }
  throw new Error('连接失败');
};
const v = async b => {
  b = new Uint8Array(b);
  let j = 18 + b[17], P = (b[j + 1] << 8) | b[j + 2], H = '', i = j + 4;
  switch (b[j + 3]) {
    case 1: H = `${b[i++]}.${b[i++]}.${b[i++]}.${b[i++]}`; break;
    case 2: { const l = b[i++]; H = d.decode(b.subarray(i, i + l)); i += l; } break;
    case 3: H = Array.from({ length: 8 }, (_, k) => ((b[i + 2 * k] << 8) | b[i + 2 * k + 1]).toString(16)).join(':'); i += 16;
  }
  return t(H, P, b.slice(i));
};
const m = (w, s, a) => {
  const x = s.writable.getWriter();
  w.send(new Uint8Array([0, 0]));
  a && x.write(a);
  let b = [], y, z = 0;
  const q = () => {
    z || (z = 1, y && clearTimeout(y), x.releaseLock().catch(() => {}), s.close().catch(() => {}), w.close().catch(() => {}), b = null);
  };
  w.onmessage = ({ data }) => {
    if (z) return;
    const l = data instanceof ArrayBuffer ? new Uint8Array(data) : e.encode(data);
    b.push(l);
    y || (y = setTimeout(() => {
      if (z) return;
      const o = b.length === 1 ? b[0] : (() => {
        let l = 0;
        b.forEach(c => l += c.length);
        const d = new Uint8Array(l);
        let p = 0;
        return b.forEach(c => (d.set(c, p), p += c.length)), d;
      })();
      x.write(o).catch(q);
      b.length = 0;
      y = null;
    }, 5));
  };
  s.readable.pipeTo(new WritableStream({
    write: d => w.send(d),
    close: q,
    abort: q
  })).catch(q);
  w.onclose = q;
};
const f = h => {
  const t = (a, b = n) => {
    const [H, P = 443] = a.split(':');
    return `vless://${u}@${H}:${P}?encryption=none&security=tls&type=ws&host=${h}&sni=${h}&path=%2F%3Fed%3D2560#${encodeURIComponent(b)}`;
  };
  return p.map(a => {
    const [c, d] = a.split('#');
    return t(c, d);
  }).join('\n') + `\n` + t(h);
};
export default {
  async fetch(req, env, ctx) {
    const { headers, url } = req, host = headers.get('Host');
    if (headers.get('Upgrade') !== 'websocket') {
      const { pathname } = new URL(url);
      if (pathname === `/${i}`) {
        return new Response(`订阅地址: https://${host}/${i}/vless`);
      }
      if (pathname === `/${i}/vless`) {
        const cache = caches.default;
        const cacheKey = `https://${host}/${i}/vless`;
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
        const responseBody = f(host);
        const response = new Response(responseBody, {
          headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' }
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      }
      return new Response('Hello Worker!');
    }
    try {
      const p = headers.get('sec-websocket-protocol'), d = Uint8Array.from(atob(p.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      if (!c(d.subarray(1, 17))) return new Response('无效UUID', { status: 403 });
      const { tcpSocket: s, initialData: a } = await v(d.buffer), [C, S] = Object.values(new WebSocketPair);
      S.accept();
      m(S, s, a);
      return new Response(null, { status: 101, webSocket: C });
    } catch (e) {
      return new Response('连接失败: ' + e.message, { status: 502 });
    }
  }
};
