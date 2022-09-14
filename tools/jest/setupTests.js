/**
 * Copyright (c) Microsoft. All rights reserved.
 */

const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const { initializeIcons } = require('@fluentui/react');
const crypto = require('crypto');

enzyme.configure({ adapter: new Adapter() });
initializeIcons();

/**
 * Suppresses the console warning messages from Ui Fabric.
 */
global.console.warn = jest.fn();

/**
 * Mocks request animation frame into set timeout calls
 * for easier testing using jest timers.
 */
global.requestAnimationFrame = callback => {
    setTimeout(callback, 0);
};

/**
 * Mocks file service related functions.
 */
global.URL.createObjectURL = () => 'Sample Url';

/**
 * Mocks the window open function.
 */
global.open = jest.fn();

/**
 * Mocks the cryptographically secure random number
 * generator since it is not implemented in runner.
 */
global.crypto = {
    getRandomValues: arr => crypto.randomBytes(arr.length)
};

navigator.clipboard = {
    writeText: jest.fn()
};

/**
 * Mocks the window SVGPathElement function.
 */
window.SVGPathElement = function() {};

/**
 * Mocks the DOM resize watcher module since it
 * is not implemented in JSDOM.
 */
jest.mock('src/labeler/utils/resizeWatcher');

/**
 * Mocks scrolling on elements since it doesn't
 * fire correctly due to JsDom limitation.
 */
Element.prototype.scrollIntoView = jest.fn();

/**
 * Mocks the window location object to enable
 * assigning values and asserting window.location.
 */
const windowLocation = JSON.stringify(window.location);
delete window.location;
Object.defineProperty(window, 'location', { value: JSON.parse(windowLocation) });
window.location.assign = jest.fn();
window.location.replace = jest.fn();

/**
 * Mock WcpConsent namespace
 */
global.WcpConsent = { init: jest.fn() };