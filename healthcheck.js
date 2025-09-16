#!/usr/bin/env node

/**
 * 🏥 개-사주 서비스 Health Check
 * Docker 컨테이너 상태 확인용 스크립트
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/',
  method: 'GET',
  timeout: 3000,
  headers: {
    'User-Agent': 'Docker-HealthCheck/1.0'
  }
};

const request = http.request(options, (res) => {
  console.log(`✅ Health check passed: ${res.statusCode}`);
  
  if (res.statusCode >= 200 && res.statusCode < 400) {
    process.exit(0);
  } else {
    console.error(`❌ Health check failed: HTTP ${res.statusCode}`);
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`❌ Health check failed: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('❌ Health check failed: Request timeout');
  request.destroy();
  process.exit(1);
});

request.setTimeout(3000);
request.end();
