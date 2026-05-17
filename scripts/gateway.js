const http = require('http');
const net = require('net');
const url = require('url');

const GATEWAY_PORT = 81;
const DEFAULT_TARGET = 3000;

function resolveRoute(reqUrl) {
  const parsedUrl = url.parse(reqUrl, true);
  let targetPort = DEFAULT_TARGET;
  let targetPath = reqUrl;

  const rawTransformPort = parsedUrl.query.XTransformPort;
  if (rawTransformPort) {
    if (rawTransformPort.includes('/')) {
      // Handles formats like "3010/webhook" or "3011/telegram-webhook"
      const parts = rawTransformPort.split('/');
      targetPort = parseInt(parts[0]) || DEFAULT_TARGET;
      
      const pathSuffix = '/' + parts.slice(1).join('/');
      const newQuery = { ...parsedUrl.query };
      delete newQuery.XTransformPort;
      
      const searchParams = new URLSearchParams();
      for (const [key, val] of Object.entries(newQuery)) {
        searchParams.append(key, val);
      }
      const searchStr = searchParams.toString();
      targetPath = pathSuffix + (searchStr ? '?' + searchStr : '');
      
      console.log(`✨ [Gateway Rewrite] Detected malformed webhook query. Rewriting ${reqUrl} -> port ${targetPort}, path ${targetPath}`);
    } else {
      targetPort = parseInt(rawTransformPort) || DEFAULT_TARGET;
    }
  }

  return { targetPort, targetPath };
}

const server = http.createServer((req, res) => {
  const { targetPort, targetPath } = resolveRoute(req.url);

  console.log(`[Gateway HTTP] ${req.method} ${req.url} -> port ${targetPort}, path ${targetPath}`);

  // Create proxy request
  const proxyReq = http.request({
    host: '127.0.0.1',
    port: targetPort,
    path: targetPath,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[Gateway HTTP Error] Failed to connect to port ${targetPort}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Bad Gateway: Failed to connect to local port ${targetPort}`);
  });

  req.pipe(proxyReq);
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  const { targetPort, targetPath } = resolveRoute(req.url);

  console.log(`[Gateway WS Upgrade] ${req.url} -> port ${targetPort}, path ${targetPath}`);

  const targetSocket = net.connect(targetPort, '127.0.0.1', () => {
    // Reconstruct HTTP upgrade request headers
    let rawHeaders = `${req.method} ${targetPath} HTTP/${req.httpVersion}\r\n`;
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      rawHeaders += `${req.rawHeaders[i]}: ${req.rawHeaders[i+1]}\r\n`;
    }
    rawHeaders += '\r\n';

    targetSocket.write(rawHeaders);
    if (head && head.length > 0) {
      targetSocket.write(head);
    }

    // Bidirectional pipe
    socket.pipe(targetSocket).pipe(socket);
  });

  targetSocket.on('error', (err) => {
    console.error(`[Gateway WS Error] Failed to connect to port ${targetPort}:`, err.message);
    socket.destroy();
  });

  targetSocket.on('end', () => {
    console.log(`[Gateway WS Target End] target port ${targetPort} closed write side`);
  });

  targetSocket.on('close', (hadError) => {
    console.log(`[Gateway WS Target Close] target port ${targetPort} closed, hadError: ${hadError}`);
  });

  socket.on('error', (err) => {
    console.error(`[Gateway WS Client Error]:`, err.message);
    targetSocket.destroy();
  });

  socket.on('end', () => {
    console.log(`[Gateway WS Client End] client closed write side`);
  });

  socket.on('close', (hadError) => {
    console.log(`[Gateway WS Client Close] client closed, hadError: ${hadError}`);
  });
});

server.listen(GATEWAY_PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`🚀 BeautyVote Local Gateway running on port ${GATEWAY_PORT}`);
  console.log(`   - Routes queries like ?XTransformPort=3011 to local services`);
  console.log(`   - Self-heals malformed webhooks like ?XTransformPort=3010/webhook`);
  console.log(`   - Fallback/Default routes to Next.js on port 3000`);
  console.log(`   👉 Set Cloudflare Tunnel to point to port ${GATEWAY_PORT}`);
  console.log(`==================================================\n`);
});
