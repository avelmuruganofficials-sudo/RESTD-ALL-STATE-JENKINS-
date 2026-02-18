import fs from 'fs';
import path from 'path';

/**
 * Sets up network capture listeners on a Playwright page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Array} - Array that will be populated with network logs
 */
export function setupNetworkCapture(page) {
  const networkLogs = [];

  // Capture all outgoing requests
  page.on('request', request => {
    const resourceType = request.resourceType();
    if (resourceType === 'xhr' || resourceType === 'fetch') {
      const entry = {
        type: 'request',
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        resourceType: resourceType,
        postData: null
      };

      try {
        entry.postData = request.postDataJSON();
      } catch {
        entry.postData = request.postData();
      }

      networkLogs.push(entry);
      console.log(`[NET] ${request.method()} ${request.url()}`);
    }
  });

  // Capture all responses
  page.on('response', async response => {
    const request = response.request();
    const resourceType = request.resourceType();

    if (resourceType === 'xhr' || resourceType === 'fetch') {
      const entry = {
        type: 'response',
        timestamp: new Date().toISOString(),
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        body: null
      };

      // Try to capture response body
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          entry.body = await response.json();
        } else if (contentType.includes('text')) {
          const text = await response.text();
          entry.body = text.substring(0, 1000); // Limit text to 1000 chars
        }
      } catch {
        entry.body = '[Could not capture response body]';
      }

      networkLogs.push(entry);

      const statusEmoji = response.status() >= 400 ? '[ERR]' : '[OK]';
      console.log(`${statusEmoji} ${response.status()} ${response.url()}`);
    }
  });

  // Capture failed requests (timeouts, network errors)
  page.on('requestfailed', request => {
    const resourceType = request.resourceType();
    if (resourceType === 'xhr' || resourceType === 'fetch') {
      const failure = request.failure();
      const entry = {
        type: 'failed',
        timestamp: new Date().toISOString(),
        url: request.url(),
        method: request.method(),
        errorText: failure ? failure.errorText : 'Unknown error'
      };

      networkLogs.push(entry);
      console.log(`[FAIL] ${request.method()} ${request.url()} - ${entry.errorText}`);
    }
  });

  return networkLogs;
}

/**
 * Saves network logs to a JSON file
 * @param {Array} logs - Network logs array
 * @param {string} filename - Output filename (relative or absolute path)
 */
export function saveNetworkLogs(logs, filename) {
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const summary = {
    totalRequests: logs.filter(l => l.type === 'request').length,
    totalResponses: logs.filter(l => l.type === 'response').length,
    failedRequests: logs.filter(l => l.type === 'failed').length,
    errors: logs.filter(l => l.type === 'response' && l.status >= 400).length,
    capturedAt: new Date().toISOString(),
    logs: logs
  };

  fs.writeFileSync(filename, JSON.stringify(summary, null, 2));
  console.log(`[NET] Saved ${logs.length} network entries to ${filename}`);
}

/**
 * Filters logs by URL pattern
 * @param {Array} logs - Network logs array
 * @param {string|RegExp} pattern - URL pattern to filter by
 * @returns {Array} - Filtered logs
 */
export function filterByUrl(logs, pattern) {
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return logs.filter(log => regex.test(log.url));
}

/**
 * Gets a summary of network activity
 * @param {Array} logs - Network logs array
 * @returns {Object} - Summary object
 */
export function getNetworkSummary(logs) {
  const requests = logs.filter(l => l.type === 'request');
  const responses = logs.filter(l => l.type === 'response');
  const failed = logs.filter(l => l.type === 'failed');
  const errors = responses.filter(l => l.status >= 400);

  return {
    totalRequests: requests.length,
    totalResponses: responses.length,
    failedRequests: failed.length,
    httpErrors: errors.length,
    failedUrls: failed.map(l => ({ url: l.url, error: l.errorText })),
    errorResponses: errors.map(l => ({ url: l.url, status: l.status }))
  };
}
