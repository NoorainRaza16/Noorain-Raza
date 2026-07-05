#!/usr/bin/env node

/**
 * External Keep-Alive Service for Render Free Tier
 * This script can be run on a separate service or cron job
 * to keep your main application awake
 */

const https = require('https');
const http = require('http');

class KeepAliveService {
  constructor(config = {}) {
    this.url = config.url || process.env.TARGET_URL;
    this.interval = config.interval || 14 * 60 * 1000; // 14 minutes
    this.timeout = config.timeout || 30000; // 30 seconds
    this.retries = config.retries || 3;
    this.userAgent = config.userAgent || 'KeepAlive-External/1.0';
    
    if (!this.url) {
      throw new Error('TARGET_URL environment variable or url config is required');
    }
    
    this.intervalId = null;
    this.isRunning = false;
  }

  async ping() {
    const url = new URL(this.url);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json,text/html,*/*',
        'Cache-Control': 'no-cache'
      },
      timeout: this.timeout
    };

    const client = url.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: data.slice(0, 500), // Limit data for logging
            timestamp: new Date().toISOString()
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async pingWithRetry() {
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const result = await this.ping();
        
        if (result.statusCode >= 200 && result.statusCode < 300) {
          console.log(`✓ Keep-alive ping successful: ${result.statusCode} ${result.statusMessage} (${result.timestamp})`);
          return result;
        } else {
          console.warn(`⚠ Keep-alive ping returned ${result.statusCode}: ${result.statusMessage} (attempt ${attempt}/${this.retries})`);
        }
      } catch (error) {
        console.error(`✗ Keep-alive ping failed (attempt ${attempt}/${this.retries}): ${error.message}`);
        
        if (attempt === this.retries) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Keep-alive service is already running');
      return;
    }

    console.log(`Starting keep-alive service for ${this.url}`);
    console.log(`Ping interval: ${this.interval / 1000 / 60} minutes`);
    console.log(`Request timeout: ${this.timeout / 1000} seconds`);
    console.log(`Max retries: ${this.retries}`);

    // Immediate ping
    this.pingWithRetry().catch(error => {
      console.error('Initial ping failed:', error.message);
    });

    // Set up interval
    this.intervalId = setInterval(async () => {
      try {
        await this.pingWithRetry();
      } catch (error) {
        console.error('All ping attempts failed:', error.message);
      }
    }, this.interval);

    this.isRunning = true;
    console.log('Keep-alive service started successfully');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Keep-alive service is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Keep-alive service stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      url: this.url,
      interval: this.interval,
      timeout: this.timeout,
      retries: this.retries,
      nextPing: this.isRunning ? new Date(Date.now() + this.interval).toISOString() : null
    };
  }
}

// CLI usage
if (require.main === module) {
  const config = {
    url: process.argv[2] || process.env.TARGET_URL,
    interval: parseInt(process.env.PING_INTERVAL) || 14 * 60 * 1000,
    timeout: parseInt(process.env.PING_TIMEOUT) || 30000,
    retries: parseInt(process.env.PING_RETRIES) || 3
  };

  if (!config.url) {
    console.error('Usage: node keep-alive.js <url>');
    console.error('   or: TARGET_URL=<url> node keep-alive.js');
    process.exit(1);
  }

  const keepAlive = new KeepAliveService(config);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully...');
    keepAlive.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    keepAlive.stop();
    process.exit(0);
  });

  // Start the service
  try {
    keepAlive.start();
  } catch (error) {
    console.error('Failed to start keep-alive service:', error.message);
    process.exit(1);
  }

  // Keep the process running
  process.stdin.resume();
}

module.exports = KeepAliveService;