#!/usr/bin/env node
/**
 * Download game assets for CI builds.
 *
 * All game assets (~483MB) are not committed to the repository to keep it lightweight.
 * This script downloads them from a GitHub Release asset before building the APK.
 *
 * Usage:
 *   node scripts/download-assets.cjs
 *
 * Environment variables:
 *   ASSETS_URL - URL to download the assets archive (default: from GitHub Release)
 *   ASSETS_RELEASE_TAG - GitHub Release tag to download from (default: assets-v2)
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const { execSync } = require('node:child_process');

const REPO = 'banard2049-cpu/KDM_hunt';
const DEFAULT_RELEASE_TAG = 'assets-v2';
const ASSET_NAME = 'kdm-hunt-assets.tar.gz';
const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

// Expected asset directories
const REQUIRED_DIRS = ['board', 'cards', 'hunt-backs', 'hunt-sheets', 'loot'];

/**
 * Download file from URL to target path with progress
 */
function download(url, targetPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading from: ${url}`);
    const file = fs.createWriteStream(targetPath);

    https.get(url, { headers: { 'User-Agent': 'KDM-Hunt-CI' } }, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        fs.unlinkSync(targetPath);
        return download(response.headers.location, targetPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(targetPath);
        return reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
      }

      const totalBytes = parseInt(response.headers['content-length'], 10);
      let downloadedBytes = 0;
      let lastUpdate = Date.now();

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const now = Date.now();

        // Update progress every 500ms
        if (now - lastUpdate > 500 || downloadedBytes === totalBytes) {
          const percent = totalBytes ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
          const mb = (downloadedBytes / 1024 / 1024).toFixed(1);
          process.stdout.write(`\rProgress: ${percent}% (${mb}MB/${(totalBytes / 1024 / 1024).toFixed(1)}MB)`);
          lastUpdate = now;
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\n✓ Download complete');
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      reject(err);
    });
  });
}

/**
 * Get the download URL for the assets from GitHub Release
 */
async function getAssetUrl() {
  // Check for custom URL first
  if (process.env.ASSETS_URL) {
    console.log('Using custom assets URL from ASSETS_URL environment variable');
    return process.env.ASSETS_URL;
  }

  const releaseTag = process.env.ASSETS_RELEASE_TAG || DEFAULT_RELEASE_TAG;
  const apiUrl = `https://api.github.com/repos/${REPO}/releases/tags/${releaseTag}`;

  return new Promise((resolve, reject) => {
    console.log(`Fetching release info for tag: ${releaseTag}`);

    const headers = {
      'User-Agent': 'KDM-Hunt-CI',
      'Accept': 'application/vnd.github.v3+json'
    };

    // Use GitHub token if available (for CI or higher rate limits)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    https.get(apiUrl, { headers }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        if (response.statusCode === 404) {
          return reject(new Error(
            `Release "${releaseTag}" not found. Please create it with:\n` +
            `  gh release create ${releaseTag} --title "Game Assets" --notes "游戏资源包" kdm-hunt-assets.tar.gz`
          ));
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`GitHub API error: ${response.statusCode}\n${data}`));
        }

        try {
          const release = JSON.parse(data);
          const asset = release.assets?.find(a => a.name === ASSET_NAME);

          if (!asset) {
            return reject(new Error(
              `Asset "${ASSET_NAME}" not found in release "${releaseTag}"\n` +
              `Available assets: ${release.assets?.map(a => a.name).join(', ') || 'none'}`
            ));
          }

          resolve(asset.browser_download_url);
        } catch (err) {
          reject(new Error(`Failed to parse GitHub API response: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Check if assets already exist and are complete
 */
function assetsExist() {
  if (!fs.existsSync(ASSETS_DIR)) {
    return false;
  }

  // Check if all required directories exist and are non-empty
  for (const dir of REQUIRED_DIRS) {
    const dirPath = path.join(ASSETS_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Missing directory: ${dir}/`);
      return false;
    }

    const files = fs.readdirSync(dirPath);
    if (files.length === 0) {
      console.log(`Empty directory: ${dir}/`);
      return false;
    }
  }

  return true;
}

async function main() {
  console.log('KDM Hunt Assets Downloader');
  console.log('==========================\n');

  // Check if already exists
  if (assetsExist()) {
    console.log('✓ All assets already present, skipping download');
    return;
  }

  console.log('Assets not found or incomplete, downloading...\n');

  // Create assets directory if needed
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  // Get download URL
  let url;
  try {
    url = await getAssetUrl();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  // Download archive
  const archivePath = path.join(ROOT_DIR, 'kdm-hunt-assets.tar.gz');
  try {
    await download(url, archivePath);
  } catch (err) {
    console.error(`Download failed: ${err.message}`);
    process.exit(1);
  }

  // Extract archive
  console.log('\nExtracting archive...');
  try {
    execSync(`tar -xzf "${archivePath}" -C "${ROOT_DIR}"`, {
      stdio: 'inherit'
    });
  } catch (err) {
    console.error(`Extraction failed: ${err.message}`);
    process.exit(1);
  }

  // Clean up
  fs.unlinkSync(archivePath);
  console.log('✓ Cleanup complete');

  // Verify extraction
  console.log('\nVerifying extracted assets:');
  let allOk = true;
  for (const dir of REQUIRED_DIRS) {
    const dirPath = path.join(ASSETS_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`✗ ${dir}/ - NOT FOUND`);
      allOk = false;
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));
    console.log(`✓ ${dir}/ - ${files.length} files`);
  }

  if (!allOk) {
    console.error('\nError: Some assets are missing after extraction');
    process.exit(1);
  }

  console.log('\n✓ All assets downloaded and extracted successfully');
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
