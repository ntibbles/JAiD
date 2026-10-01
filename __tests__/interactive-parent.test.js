/**
 * Unit tests for interactive parent detection and button positioning
 * Tests WCAG 4.1.2 compliance - no nested interactive controls
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Read the actual content.js file
const contentScript = fs.readFileSync(
  path.join(__dirname, '../content.js'),
  'utf8'
);

describe('Interactive Parent Detection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.aiAltTextInjected = false;
  });

  test('should detect anchor element as interactive parent', () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://example.com';
    
    const img = document.createElement('img');
    img.src = 'test.png';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 100, left: 100, bottom: 400, right: 400
    });
    
    anchor.appendChild(img);
    document.body.appendChild(anchor);
    
    eval(contentScript);
    
    // Check that wrapper exists but is positioned outside the anchor
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.position).toBe('absolute');
    expect(wrapper.style.pointerEvents).toBe('none');
  });

  test('should detect button element as interactive parent', () => {
    const button = document.createElement('button');
    
    const img = document.createElement('img');
    img.src = 'test.jpg';
    Object.defineProperty(img, 'naturalWidth', { value: 400, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 400, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 400, height: 400, top: 50, left: 50, bottom: 450, right: 450
    });
    
    button.appendChild(img);
    document.body.appendChild(button);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.position).toBe('absolute');
  });

  test('should detect element with role="button" as interactive', () => {
    const div = document.createElement('div');
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    
    const img = document.createElement('img');
    img.src = 'test.webp';
    Object.defineProperty(img, 'naturalWidth', { value: 500, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 500, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 500, height: 500, top: 0, left: 0, bottom: 500, right: 500
    });
    
    div.appendChild(img);
    document.body.appendChild(div);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.position).toBe('absolute');
  });

  test('should detect element with role="link" as interactive', () => {
    const div = document.createElement('div');
    div.setAttribute('role', 'link');
    div.setAttribute('tabindex', '0');
    
    const img = document.createElement('img');
    img.src = 'test.png';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 100, left: 100, bottom: 400, right: 400
    });
    
    div.appendChild(img);
    document.body.appendChild(div);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.position).toBe('absolute');
  });

  test('should handle deeply nested image in anchor', () => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    
    const img = document.createElement('img');
    img.src = 'test.jpg';
    Object.defineProperty(img, 'naturalWidth', { value: 350, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 350, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 350, height: 350, top: 0, left: 0, bottom: 350, right: 350
    });
    
    div2.appendChild(img);
    div1.appendChild(div2);
    anchor.appendChild(div1);
    document.body.appendChild(anchor);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.position).toBe('absolute');
  });

  test('should NOT detect interactive parent for regular div', () => {
    const div = document.createElement('div');
    
    const img = document.createElement('img');
    img.src = 'test.png';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 100, left: 100, bottom: 400, right: 400
    });
    
    div.appendChild(img);
    document.body.appendChild(div);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.position).toBe('relative');
    expect(wrapper.style.display).toBe('inline-block');
  });

  test('should handle image directly in body (no parent)', () => {
    const img = document.createElement('img');
    img.src = 'test.webp';
    Object.defineProperty(img, 'naturalWidth', { value: 400, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 400, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 400, height: 400, top: 0, left: 0, bottom: 400, right: 400
    });
    
    document.body.appendChild(img);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.position).toBe('relative');
  });
});

describe('Button Positioning Outside Interactive Elements', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.aiAltTextInjected = false;
  });

  test('should position button outside anchor element', () => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    
    const img = document.createElement('img');
    img.src = 'test.png';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 100, left: 100, bottom: 400, right: 400
    });
    
    anchor.appendChild(img);
    document.body.appendChild(anchor);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    const button = wrapper.querySelector('.ai-alt-info-button');
    
    // Wrapper should be sibling to anchor, not child
    expect(wrapper.parentElement).toBe(document.body);
    expect(anchor.contains(wrapper)).toBe(false);
    
    // Button should have pointer events enabled
    expect(button.style.pointerEvents).toBe('auto');
  });

  test('should position button outside button element', () => {
    const buttonParent = document.createElement('button');
    
    const img = document.createElement('img');
    img.src = 'test.jpg';
    Object.defineProperty(img, 'naturalWidth', { value: 250, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 250, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 250, height: 250, top: 50, left: 50, bottom: 300, right: 300
    });
    
    buttonParent.appendChild(img);
    document.body.appendChild(buttonParent);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    
    // Wrapper should NOT be inside the button parent
    expect(buttonParent.contains(wrapper)).toBe(false);
    expect(wrapper.parentElement).toBe(document.body);
  });

  test('should set pointer-events none on wrapper but auto on button', () => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    
    const img = document.createElement('img');
    img.src = 'test.webp';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 0, left: 0, bottom: 300, right: 300
    });
    
    anchor.appendChild(img);
    document.body.appendChild(anchor);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    const button = wrapper.querySelector('.ai-alt-info-button');
    
    // Wrapper blocks pointer events to allow clicks through to anchor
    expect(wrapper.style.pointerEvents).toBe('none');
    
    // Button re-enables pointer events
    expect(button.style.pointerEvents).toBe('auto');
  });

  test('should store image ID reference for positioning', () => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    
    const img = document.createElement('img');
    img.src = 'test.png';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 100, left: 100, bottom: 400, right: 400
    });
    
    anchor.appendChild(img);
    document.body.appendChild(anchor);
    
    eval(contentScript);
    
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    const imageId = img.getAttribute('id');
    
    expect(wrapper.getAttribute('data-target-image')).toBe(imageId);
    expect(wrapper.getAttribute('data-image-id')).toBe(imageId);
  });
});

describe('WCAG 4.1.2 Compliance - No Nested Interactive Controls', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.aiAltTextInjected = false;
  });

  test('should prevent nested button inside anchor', () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://example.com';
    
    const img = document.createElement('img');
    img.src = 'test.jpg';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 100, left: 100, bottom: 400, right: 400
    });
    
    anchor.appendChild(img);
    document.body.appendChild(anchor);
    
    eval(contentScript);
    
    const button = document.querySelector('.ai-alt-info-button');
    
    // Button should NOT be inside anchor
    expect(anchor.contains(button)).toBe(false);
    
    // Button should be in wrapper which is outside anchor
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    expect(wrapper.contains(button)).toBe(true);
    expect(anchor.contains(wrapper)).toBe(false);
  });

  test('should prevent nested button inside button', () => {
    const buttonParent = document.createElement('button');
    
    const img = document.createElement('img');
    img.src = 'test.png';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 0, left: 0, bottom: 300, right: 300
    });
    
    buttonParent.appendChild(img);
    document.body.appendChild(buttonParent);
    
    eval(contentScript);
    
    const infoButton = document.querySelector('.ai-alt-info-button');
    
    // Info button should NOT be inside button parent
    expect(buttonParent.contains(infoButton)).toBe(false);
  });

  test('should allow button inside regular div', () => {
    const div = document.createElement('div');
    
    const img = document.createElement('img');
    img.src = 'test.webp';
    Object.defineProperty(img, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    img.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 100, left: 100, bottom: 400, right: 400
    });
    
    div.appendChild(img);
    document.body.appendChild(div);
    
    eval(contentScript);
    
    const button = document.querySelector('.ai-alt-info-button');
    const wrapper = document.querySelector('.ai-alt-image-wrapper');
    
    // For non-interactive parent, wrapper wraps the image normally
    expect(wrapper.style.position).toBe('relative');
    expect(div.contains(wrapper)).toBe(true);
  });
});

describe('Multiple Images with Mixed Parents', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.aiAltTextInjected = false;
  });

  test('should handle multiple images with different parent types', () => {
    // Image in anchor
    const anchor = document.createElement('a');
    anchor.href = '#';
    const img1 = document.createElement('img');
    img1.src = 'test1.png';
    Object.defineProperty(img1, 'naturalWidth', { value: 300, configurable: true });
    Object.defineProperty(img1, 'naturalHeight', { value: 300, configurable: true });
    Object.defineProperty(img1, 'complete', { value: true, configurable: true });
    img1.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 300, height: 300, top: 0, left: 0, bottom: 300, right: 300
    });
    anchor.appendChild(img1);
    document.body.appendChild(anchor);
    
    // Image in regular div
    const div = document.createElement('div');
    const img2 = document.createElement('img');
    img2.src = 'test2.jpg';
    Object.defineProperty(img2, 'naturalWidth', { value: 400, configurable: true });
    Object.defineProperty(img2, 'naturalHeight', { value: 400, configurable: true });
    Object.defineProperty(img2, 'complete', { value: true, configurable: true });
    img2.getBoundingClientRect = jest.fn().mockReturnValue({
      width: 400, height: 400, top: 0, left: 0, bottom: 400, right: 400
    });
    div.appendChild(img2);
    document.body.appendChild(div);
    
    eval(contentScript);
    
    const wrappers = document.querySelectorAll('.ai-alt-image-wrapper');
    expect(wrappers.length).toBe(2);
    
    // First wrapper (in anchor) should be absolutely positioned
    expect(wrappers[0].style.position).toBe('absolute');
    
    // Second wrapper (in div) should be relatively positioned
    expect(wrappers[1].style.position).toBe('relative');
  });
});