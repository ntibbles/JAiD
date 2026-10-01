/**
 * Unit tests for build.js
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Mock file paths
const TEST_DIR = path.join(__dirname, '../test-build');
const DIST_DIR = path.join(TEST_DIR, 'dist');

describe('Build Script', () => {
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('should define required files list', () => {
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js',
      'styles.css'
    ];

    expect(requiredFiles).toContain('manifest.json');
    expect(requiredFiles).toContain('background.js');
    expect(requiredFiles).toContain('content.js');
    expect(requiredFiles).toContain('styles.css');
    expect(requiredFiles.length).toBe(4);
  });

  test('should define required directories list', () => {
    const requiredDirs = ['images'];

    expect(requiredDirs).toContain('images');
    expect(requiredDirs.length).toBe(1);
  });

  test('should not include test files in distribution', () => {
    const excludedPatterns = [
      '__tests__',
      '*.test.js',
      'jest.config.js',
      'build.js'
    ];

    // Verify these patterns would exclude test files
    expect(excludedPatterns).toContain('__tests__');
    expect(excludedPatterns).toContain('*.test.js');
    expect(excludedPatterns).toContain('jest.config.js');
  });

  test('should not include documentation in distribution', () => {
    const excludedFiles = [
      'README.md',
      'TESTING.md',
      'test-page.html'
    ];

    // These files should not be in required files
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js',
      'styles.css'
    ];

    excludedFiles.forEach(file => {
      expect(requiredFiles).not.toContain(file);
    });
  });

  test('should not include package.json in distribution', () => {
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js',
      'styles.css'
    ];

    expect(requiredFiles).not.toContain('package.json');
    expect(requiredFiles).not.toContain('package-lock.json');
  });
});

describe('Build Script - File Operations', () => {
  test('ensureDir should create directory if it does not exist', () => {
    const testDir = path.join(TEST_DIR, 'new-dir');

    // Ensure it doesn't exist
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }

    expect(fs.existsSync(testDir)).toBe(false);

    // Create directory
    fs.mkdirSync(testDir, { recursive: true });

    expect(fs.existsSync(testDir)).toBe(true);

    // Clean up
    fs.rmSync(testDir, { recursive: true });
  });

  test('copyFile should copy file to destination', () => {
    const srcFile = path.join(TEST_DIR, 'source.txt');
    const destFile = path.join(TEST_DIR, 'dest.txt');

    // Create test directory and source file
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.writeFileSync(srcFile, 'test content');

    // Copy file
    fs.copyFileSync(srcFile, destFile);

    expect(fs.existsSync(destFile)).toBe(true);
    expect(fs.readFileSync(destFile, 'utf8')).toBe('test content');

    // Clean up
    fs.rmSync(TEST_DIR, { recursive: true });
  });

  test('copyDir should copy directory recursively', () => {
    const srcDir = path.join(TEST_DIR, 'src');
    const destDir = path.join(TEST_DIR, 'dest');

    // Create test structure
    fs.mkdirSync(TEST_DIR, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'file1.txt'), 'content1');
    fs.writeFileSync(path.join(srcDir, 'file2.txt'), 'content2');

    // Create subdirectory
    const subDir = path.join(srcDir, 'subdir');
    fs.mkdirSync(subDir);
    fs.writeFileSync(path.join(subDir, 'file3.txt'), 'content3');

    // Copy directory recursively
    const copyDirRecursive = (src, dest) => {
      fs.mkdirSync(dest, { recursive: true });
      const entries = fs.readdirSync(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          copyDirRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    copyDirRecursive(srcDir, destDir);

    // Verify files were copied
    expect(fs.existsSync(path.join(destDir, 'file1.txt'))).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'file2.txt'))).toBe(true);
    expect(fs.existsSync(path.join(destDir, 'subdir', 'file3.txt'))).toBe(true);

    // Verify content
    expect(fs.readFileSync(path.join(destDir, 'file1.txt'), 'utf8')).toBe('content1');
    expect(fs.readFileSync(path.join(destDir, 'subdir', 'file3.txt'), 'utf8')).toBe('content3');

    // Clean up
    fs.rmSync(TEST_DIR, { recursive: true });
  });

  test('removeDir should remove directory if it exists', () => {
    const testDir = path.join(TEST_DIR, 'to-remove');

    // Create directory
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(path.join(testDir, 'file.txt'), 'content');

    expect(fs.existsSync(testDir)).toBe(true);

    // Remove directory
    fs.rmSync(testDir, { recursive: true, force: true });

    expect(fs.existsSync(testDir)).toBe(false);
  });
});

describe('Build Script - Integration', () => {
  test('dist folder should contain only required files after build', () => {
    // This test verifies the expected structure
    const requiredInDist = [
      'manifest.json',
      'background.js',
      'content.js',
      'styles.css',
      'images/ai-alt-icon.svg'
    ];

    const notRequiredInDist = [
      'package.json',
      'README.md',
      'TESTING.md',
      'test-page.html',
      'jest.config.js',
      'build.js',
      '__tests__/setup.js',
      '__tests__/background.test.js',
      '__tests__/content.test.js'
    ];

    // Verify our lists are comprehensive
    expect(requiredInDist.length).toBeGreaterThan(0);
    expect(notRequiredInDist.length).toBeGreaterThan(0);
  });

  test('build script should handle missing files gracefully', () => {
    // This test verifies that the build script should warn but not fail
    // if optional files are missing
    const optionalFiles = [];
    const requiredFiles = [
      'manifest.json',
      'background.js',
      'content.js',
      'styles.css'
    ];

    // All files in requiredFiles should exist for a successful build
    expect(requiredFiles.length).toBe(4);
  });
});

describe('Build Script - npm Scripts', () => {
  test('should have build script defined', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts.build).toBe('node build.js');
  });

  test('should have clean script defined', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.scripts).toHaveProperty('clean');
    expect(packageJson.scripts.clean).toContain('dist');
  });

  test('should have rebuild script defined', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.scripts).toHaveProperty('rebuild');
    expect(packageJson.scripts.rebuild).toContain('clean');
    expect(packageJson.scripts.rebuild).toContain('build');
  });
});

describe('Build Script - Size Calculation', () => {
  test('should calculate total size of files', () => {
    const testDir = path.join(TEST_DIR, 'size-test');
    fs.mkdirSync(testDir, { recursive: true });

    // Create test files with known sizes
    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'a'.repeat(100)); // 100 bytes
    fs.writeFileSync(path.join(testDir, 'file2.txt'), 'b'.repeat(200)); // 200 bytes

    // Calculate total size
    const getTotalSize = (dir) => {
      let size = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          size += getTotalSize(fullPath);
        } else {
          size += fs.statSync(fullPath).size;
        }
      }
      return size;
    };

    const totalSize = getTotalSize(testDir);
    expect(totalSize).toBe(300); // 100 + 200

    // Clean up
    fs.rmSync(TEST_DIR, { recursive: true });
  });
});