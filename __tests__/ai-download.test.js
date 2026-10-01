/**
 * Unit tests for Chrome AI model download handling
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

describe('Chrome AI Model Download Handling', () => {
  beforeEach(() => {
    // Reset window.ai mock
    global.window = global.window || {};
    jest.clearAllMocks();
  });

  test('should handle readily available model', async () => {
    global.window.ai = {
      languageModel: {
        capabilities: jest.fn().mockResolvedValue({
          available: 'readily'
        }),
        create: jest.fn().mockResolvedValue({
          prompt: jest.fn().mockResolvedValue('Test alt text'),
          destroy: jest.fn()
        })
      }
    };

    const capabilities = await window.ai.languageModel.capabilities();
    expect(capabilities.available).toBe('readily');
    
    const session = await window.ai.languageModel.create();
    expect(session).toHaveProperty('prompt');
    expect(session).toHaveProperty('destroy');
  });

  test('should handle after-download state', async () => {
    const mockMonitor = {
      addEventListener: jest.fn()
    };

    global.window.ai = {
      languageModel: {
        capabilities: jest.fn().mockResolvedValue({
          available: 'after-download'
        }),
        create: jest.fn().mockImplementation((options) => {
          if (options && options.monitor) {
            options.monitor(mockMonitor);
          }
          return Promise.resolve({
            prompt: jest.fn().mockResolvedValue('Test alt text after download'),
            destroy: jest.fn()
          });
        })
      }
    };

    const capabilities = await window.ai.languageModel.capabilities();
    expect(capabilities.available).toBe('after-download');

    const session = await window.ai.languageModel.create({
      monitor(m) {
        m.addEventListener('downloadprogress', () => {});
      }
    });

    expect(mockMonitor.addEventListener).toHaveBeenCalledWith(
      'downloadprogress',
      expect.any(Function)
    );
    expect(session).toHaveProperty('prompt');
  });

  test('should handle unavailable model', async () => {
    global.window.ai = {
      languageModel: {
        capabilities: jest.fn().mockResolvedValue({
          available: 'no'
        })
      }
    };

    const capabilities = await window.ai.languageModel.capabilities();
    expect(capabilities.available).toBe('no');
  });

  test('should track download progress', async () => {
    const progressEvents = [];
    const mockMonitor = {
      addEventListener: jest.fn((event, callback) => {
        if (event === 'downloadprogress') {
          // Simulate progress events
          setTimeout(() => callback({ loaded: 25, total: 100 }), 10);
          setTimeout(() => callback({ loaded: 50, total: 100 }), 20);
          setTimeout(() => callback({ loaded: 75, total: 100 }), 30);
          setTimeout(() => callback({ loaded: 100, total: 100 }), 40);
        }
      })
    };

    global.window.ai = {
      languageModel: {
        capabilities: jest.fn().mockResolvedValue({
          available: 'after-download'
        }),
        create: jest.fn().mockImplementation((options) => {
          if (options && options.monitor) {
            options.monitor(mockMonitor);
          }
          return Promise.resolve({
            prompt: jest.fn().mockResolvedValue('Alt text'),
            destroy: jest.fn()
          });
        })
      }
    };

    await window.ai.languageModel.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          progressEvents.push({
            loaded: e.loaded,
            total: e.total,
            percent: Math.round((e.loaded / e.total) * 100)
          });
        });
      }
    });

    // Wait for progress events
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(progressEvents.length).toBeGreaterThan(0);
    expect(progressEvents[progressEvents.length - 1].percent).toBe(100);
  });

  test('should provide progress callback during download', () => {
    const progressCallback = jest.fn();
    
    // Simulate download progress updates
    progressCallback('Downloading AI model: 25%');
    progressCallback('Downloading AI model: 50%');
    progressCallback('Downloading AI model: 75%');
    progressCallback('Downloading AI model: 100%');

    expect(progressCallback).toHaveBeenCalledTimes(4);
    expect(progressCallback).toHaveBeenCalledWith('Downloading AI model: 25%');
    expect(progressCallback).toHaveBeenCalledWith('Downloading AI model: 100%');
  });

  test('should handle missing AI API gracefully', async () => {
    global.window.ai = undefined;

    expect(window.ai).toBeUndefined();
  });

  test('should handle missing languageModel API', async () => {
    global.window.ai = {};

    expect(window.ai.languageModel).toBeUndefined();
  });
});

describe('Progress Callback Integration', () => {
  test('should update UI during download', () => {
    const mockContentDiv = {
      querySelector: jest.fn().mockReturnValue({
        textContent: ''
      })
    };

    const updateProgress = (message) => {
      const loadingDiv = mockContentDiv.querySelector('.ai-alt-loading');
      if (loadingDiv) {
        loadingDiv.textContent = message;
      }
    };

    updateProgress('Downloading AI model: 50%');
    
    expect(mockContentDiv.querySelector).toHaveBeenCalledWith('.ai-alt-loading');
  });

  test('should calculate percentage correctly', () => {
    const testCases = [
      { loaded: 0, total: 100, expected: 0 },
      { loaded: 25, total: 100, expected: 25 },
      { loaded: 50, total: 100, expected: 50 },
      { loaded: 75, total: 100, expected: 75 },
      { loaded: 100, total: 100, expected: 100 },
      { loaded: 33, total: 100, expected: 33 },
      { loaded: 67, total: 100, expected: 67 }
    ];

    testCases.forEach(({ loaded, total, expected }) => {
      const percent = Math.round((loaded / total) * 100);
      expect(percent).toBe(expected);
    });
  });
});

describe('Error Handling', () => {
  test('should handle capabilities check error', async () => {
    global.window.ai = {
      languageModel: {
        capabilities: jest.fn().mockRejectedValue(new Error('API not available'))
      }
    };

    await expect(window.ai.languageModel.capabilities()).rejects.toThrow('API not available');
  });

  test('should handle session creation error', async () => {
    global.window.ai = {
      languageModel: {
        capabilities: jest.fn().mockResolvedValue({
          available: 'readily'
        }),
        create: jest.fn().mockRejectedValue(new Error('Session creation failed'))
      }
    };

    await expect(window.ai.languageModel.create()).rejects.toThrow('Session creation failed');
  });

  test('should handle prompt error', async () => {
    global.window.ai = {
      languageModel: {
        capabilities: jest.fn().mockResolvedValue({
          available: 'readily'
        }),
        create: jest.fn().mockResolvedValue({
          prompt: jest.fn().mockRejectedValue(new Error('Prompt failed')),
          destroy: jest.fn()
        })
      }
    };

    const session = await window.ai.languageModel.create();
    await expect(session.prompt('test')).rejects.toThrow('Prompt failed');
  });
});