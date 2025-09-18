import { connect } from 'cloudflare:sockets';

const d = new TextDecoder();
const e = new TextEncoder();

// === 配置区 ===
const I = '123456';
const UUID = '5aba5b77-48eb-4ae2-b60d-5bfee7ac169e';
const P = ['1.1.1.1'];
// 回落地址，支持 host:port 或 ip:port，比如 '2.2.2.2:50000' 或 'sjc.o00o.ooo:443'
const R = 'sjc.o00o.ooo:443';
const REMARK = '狂暴';

// === UUID -> byte array ===
const U = ((hex, a = new Uint8Array(16)) => {
  hex = hex.replace(/-/g, '');
  for (let i = 0; i < 32; i += 2) a[i >> 1] = parseInt(hex.substr(i, 2), 16);
  return a;
})(UUID);

// === 简单逐字节比较校验 ===
const checkUUID = (b) => {
  for (let i = 0; i < 16; i++) if (b[i] !== U[i]) return 0;
  return 1;
};

// === 建立 TCP 连接（失败则使用回落 R） ===
const tryConnect = async (host, port, initialData) => {
  try {
    const s = await connect({ hostname: host, port });
    // 确保 socket 已打开（s.opened 可能是个 promise / 属性）
    if (s.opened instanceof Promise) await s.opened;
    return { tcpSocket: s, initialData };
  } catch (err) {
    // 如果配置了回落地址，尝试回落
    if (R) {
      const [H, P] = R.split(':');
      const portFallback = +P || port;
      return tryConnect(H, portFallback, initialData);
    }
    throw new Error('连接失败: ' + err.message);
  }
};

// === 解析 VLESS 握手包，返回目标 host:port 并尝试连接 ===
const parseVlessAndConnect = async (buf) => {
  const b = new Uint8Array(buf);
  // t = b[17] 是随机/标志位长度偏移（来自原实现）
  const t = b[17];
  // j 指向可能的 ATYP/ADDR段起点，原实现 j = 18 + t
  const j = 18 + t;
  // 端口在 j+1、j+2（原偏移），根据原代码计算
  const port = (b[j + 1] << 8) | b[j + 2];
  let idx = j + 4; // initial data 起始偏移（按照原实现）
  let host = '';

  // 使用原来索引位置判断地址类型（原版使用 b[j+3] 或 b[o-1] 的偏移）
  const atype = b[j + 3];
  switch (atype) {
    case 1: // IPv4
      host = `${b[idx++]}.${b[idx++]}.${b[idx++]}.${b[idx++]}`;
      break;
    case 2: { // Domain name
      const len = b[idx++];
      host = d.decode(b.subarray(idx, idx + len));
      idx += len;
      break;
    }
    case 3: // IPv6
      host = Array.from({ length: 8 }, (_, k) =>
        ((b[idx + 2 * k] << 8) | b[idx + 2 * k + 1]).toString(16)
      ).join(':');
      idx += 16;
      break;
    default:
      throw new Error('未知地址类型: ' + atype);
  }

  const initialData = b.slice(idx); // 握手后剩余要写入目标的初始数据
  return tryConnect(host, port, initialData);
};

// === 隧道函数：流式传输 WS <-> TCP（去掉批量 5ms 缓冲） ===
const tunnel = (ws, tcp, initialData) => {
  // writer 写入 TCP
  const writer = tcp.writable.getWriter();

  let cleaned = false;
  const cleanup = async () => {
    if (cleaned) return;
    cleaned = true;
    try { writer.releaseLock(); } catch (e) { /* ignore */ }
    try { await tcp.close(); } catch (e) { /* ignore */ }
    try { ws.close(); } catch (e) { /* ignore */ }
  };

  // 先发送握手成功确认给客户端（与原实现一致）
  try {
    ws.send(new Uint8Array([0, 0]).buffer);
  } catch (e) {
    // 如果 send 失败，直接清理
    cleanup();
    return;
  }

  // 如果有 initialData，立即写入目标 TCP
  if (initialData && initialData.length) {
    writer.write(initialData).catch(() => { cleanup(); });
  }

  // WS -> TCP：收到消息就立即写入 TCP writer（流式）
  ws.onmessage = ({ data }) => {
    if (cleaned) return;
    let chunk;
    if (data instanceof ArrayBuffer) {
      chunk = new Uint8Array(data);
    } else if (typeof data === 'string') {
      chunk = e.encode(data);
    } else {
      // 可能已经是 Uint8Array
      chunk = data;
    }
    // 直接写入（不做额外合并缓冲）
    writer.write(chunk).catch(() => { cleanup(); });
  };

  ws.onclose = () => { cleanup(); };
  ws.onerror = () => { cleanup(); };

  // TCP -> WS：使用 pipeTo 把 tcp.readable 写到一个 WritableStream，write 时直接 ws.send
  tcp.readable.pipeTo(new WritableStream({
    write(chunk) {
      if (cleaned) return;
      try {
        // 注意：WebSocket.send 可以接收 ArrayBuffer
        ws.send(chunk);
      } catch (e) {
        // 发送失败则清理
        cleanup();
      }
    },
    close() { cleanup(); },
    abort() { cleanup(); }
  })).catch(() => { cleanup(); });
};

// === 订阅生成（支持 P 列表 + 当前 host，备注 encodeURIComponent） ===
const buildConfig = (host) => {
  const buildOne = (item, defaultRemark = REMARK) => {
    const [addr, port = 443] = item.split(':');
    return `vless://${UUID}@${addr}:${port}?encryption=none&security=tls&type=ws&host=${host}&sni=${host}&path=%2F%3Fed%3D2560#${encodeURIComponent(defaultRemark)}`;
  };
  // 先把 P 数组的条目生成，最后再加上 host:443 这一条
  const lines = P.map(item => {
    const [raw, remark] = item.split('#');
    return buildOne(raw, remark || REMARK);
  });
  lines.push(buildOne(`${host}:443`, REMARK));
  return lines.join('\n') + '\n';
};

// === Worker 主逻辑 ===
export default {
  async fetch(req, env) {
    const { headers, url } = req;
    const host = headers.get('Host') || new URL(url).host;

    // 非 websocket 请求：返回订阅或提示
    if (headers.get('Upgrade') !== 'websocket') {
      const { pathname } = new URL(url);
      if (pathname === `/${I}`) {
        return new Response(`订阅地址: https://${host}/${I}/vless`);
      }
      if (pathname === `/${I}/vless`) {
        return new Response(buildConfig(host));
      }
      return new Response('Hello Worker!');
    }

    // WebSocket 握手处理
    try {
      const proto = headers.get('sec-websocket-protocol') || '';
      // WebSocket 协议字段可能被替换 - 先把 URL-safe base64 转回标准 base64，再 atob
      const b = Uint8Array.from(atob(proto.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

      // 校验 UUID（b.subarray(1,17) 为原实现使用的区间）
      if (!checkUUID(b.subarray(1, 17))) {
        return new Response('无效UUID', { status: 403 });
      }

      // parse VLESS 握手并连接目标
      const { tcpSocket, initialData } = await parseVlessAndConnect(b.buffer);

      // WebSocketPair（server 与 client） - 在 worker 端我们接管 server
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();
      tunnel(server, tcpSocket, initialData);

      return new Response(null, { status: 101, webSocket: client });
    } catch (e) {
      return new Response('连接失败: ' + (e && e.message ? e.message : String(e)), { status: 502 });
    }
  }
};
