/**
 * BizTrack LK - Concurrent Load & Latency Benchmark Script
 * Evaluates SE3090 Section 12 Performance Requirements:
 * - Concurrent requests
 * - Response times (Avg, min, max, p95)
 * - Success/failure rate
 * - Database and Agentic AI latency
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const CONCURRENT_WORKERS = 10;
const REQUESTS_PER_WORKER = 20;

const endpoints = [
  { name: 'Health Check', path: '/health', method: 'GET' },
  { name: 'Products Catalog (Filtered)', path: '/products?category=all&page=1&pageSize=10', method: 'GET' },
  { name: 'Executive Dashboard Summary', path: '/dashboard/summary', method: 'GET' },
  { name: 'Currency Conversion (Cached)', path: '/currency/rates', method: 'GET' }
];

const makeRequest = (url) => {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          duration: Date.now() - start,
          statusCode: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    }).on('error', (err) => {
      resolve({
        duration: Date.now() - start,
        statusCode: 0,
        success: false,
        error: err.message
      });
    });
  });
};

const runBenchmark = async () => {
  console.log(`=======================================================`);
  console.log(`  BizTrack LK API Performance Benchmark (SE3090)`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Concurrency: ${CONCURRENT_WORKERS} workers x ${REQUESTS_PER_WORKER} reqs = ${CONCURRENT_WORKERS * REQUESTS_PER_WORKER} reqs/endpoint`);
  console.log(`=======================================================\n`);

  for (const ep of endpoints) {
    process.stdout.write(`Testing: ${ep.name.padEnd(30)} ... `);
    const url = `${BASE_URL}${ep.path}`;
    const latencies = [];
    let successCount = 0;
    let failCount = 0;

    const workerTasks = Array.from({ length: CONCURRENT_WORKERS }, async () => {
      for (let i = 0; i < REQUESTS_PER_WORKER; i++) {
        const res = await makeRequest(url);
        latencies.push(res.duration);
        if (res.success) successCount++;
        else failCount++;
      }
    });

    const startTotal = Date.now();
    await Promise.all(workerTasks);
    const totalTimeMs = Date.now() - startTotal;

    latencies.sort((a, b) => a - b);
    const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1);
    const min = latencies[0];
    const max = latencies[latencies.length - 1];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const rps = ((latencies.length / totalTimeMs) * 1000).toFixed(1);

    console.log(`[SUCCESS: ${successCount}/${latencies.length}]`);
    console.log(`   -> Avg: ${avg}ms | Min: ${min}ms | Max: ${max}ms | p95: ${p95}ms | Throughput: ${rps} req/s\n`);
  }
};

runBenchmark();
