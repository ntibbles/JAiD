/**
 * Unit tests for background.js service worker
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

describe('Background Service Worker', () => {
  let mockTab;
  let actionClickListener;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock tab object
    mockTab = {
      id: 123,
      url: 'https://example.com'
    };

    // Mock chrome.scripting methods
    chrome.scripting.executeScript = jest.fn().mockResolvedValue([]);
    chrome.scripting.insertCSS = jest.fn().mockResolvedValue(undefined);
    
    // Capture the listener
    chrome.action.onClicked.addListener = jest.fn((callback) => {
      actionClickListener = callback;
    });

    // Load the background script logic
    require('../background.js');
  });

  test('should register action click listener on load', () => {
    expect(chrome.action.onClicked.addListener).toHaveBeenCalledTimes(1);
    expect(typeof actionClickListener).toBe('function');
  });

  test('should inject content script when extension icon is clicked', async () => {
    await actionClickListener(mockTab);

    expect(chrome.scripting.executeScript).toHaveBeenCalledTimes(1);
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: mockTab.id },
      files: ['content.js']
    });
  });

  test('should inject CSS when extension icon is clicked', async () => {
    await actionClickListener(mockTab);

    expect(chrome.scripting.insertCSS).toHaveBeenCalledTimes(1);
    expect(chrome.scripting.insertCSS).toHaveBeenCalledWith({
      target: { tabId: mockTab.id },
      files: ['styles.css']
    });
  });

  test('should inject both script and CSS in correct order', async () => {
    await actionClickListener(mockTab);

    expect(chrome.scripting.executeScript).toHaveBeenCalled();
    expect(chrome.scripting.insertCSS).toHaveBeenCalled();
    
    // Verify executeScript was called before insertCSS
    const executeScriptCall = chrome.scripting.executeScript.mock.invocationCallOrder[0];
    const insertCSSCall = chrome.scripting.insertCSS.mock.invocationCallOrder[0];
    expect(executeScriptCall).toBeLessThan(insertCSSCall);
  });

  test('should handle errors when injecting scripts', async () => {
    const error = new Error('Injection failed');
    chrome.scripting.executeScript = jest.fn().mockRejectedValue(error);

    await actionClickListener(mockTab);

    expect(console.error).toHaveBeenCalledWith(
      'Error injecting content script:',
      error
    );
  });

  test('should handle errors when injecting CSS', async () => {
    const error = new Error('CSS injection failed');
    chrome.scripting.insertCSS = jest.fn().mockRejectedValue(error);

    await actionClickListener(mockTab);

    expect(console.error).toHaveBeenCalledWith(
      'Error injecting content script:',
      error
    );
  });

  test('should work with different tab IDs', async () => {
    const tabs = [
      { id: 1, url: 'https://example1.com' },
      { id: 2, url: 'https://example2.com' },
      { id: 999, url: 'https://example3.com' }
    ];

    for (const tab of tabs) {
      jest.clearAllMocks();
      await actionClickListener(tab);

      expect(chrome.scripting.executeScript).toHaveBeenCalledWith(
        expect.objectContaining({
          target: { tabId: tab.id }
        })
      );
    }
  });
});