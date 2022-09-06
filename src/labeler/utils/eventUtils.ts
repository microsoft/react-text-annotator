/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { Disposable, DisposableAdditionOptions, DisposableLifetime, Lifetime } from '../types/labelerTypes';

const findClosestElement = (selector: string, startNode: Node, toNode: Node) => {
    while (startNode !== null && startNode !== toNode) {
        if (startNode.nodeType === Node.ELEMENT_NODE && (<Element>startNode).matches(selector)) {
            return <Element>startNode;
        }
        startNode = startNode.parentNode;
    }

    return null;
};

type EventHandler = (evt: { target: EventTarget }) => void;

const filterEventHandler = (parent: Node, selector: string, handler: EventHandler): EventHandler => evt => {
    const target = findClosestElement(selector, <Node>evt.target, parent);

    if (target) {
        handler(evt);
    }
};

type WindowEventListener = <K extends keyof WindowEventMap>(this: Window, evt: WindowEventMap[K]) => any;

/**
 * Adds a event listener to the window
 */
export const addWindowEventListener = <K extends keyof WindowEventMap>(lifetime: Lifetime, eventName: K, listener: WindowEventListener) => {
    window.addEventListener(eventName, listener);

    lifetime.add(() => {
        window.removeEventListener(eventName, listener);
    });
};

/**
 * Adds a event listener to the dom element or its children.
 */
export const addDomEventListener = (
    lifetime: Lifetime,
    element: Element,
    eventName: string,
    listener: EventListener,
    options?: { selector?: string; useCapture?: boolean }
) => {
    const { selector, useCapture } = options || { selector: null, useCapture: false };

    listener = selector ? filterEventHandler(element, selector, listener) : listener;

    element.addEventListener(eventName, listener, useCapture);

    lifetime.add(() => {
        element.removeEventListener(eventName, listener, useCapture);
    });
};

/**
 * Creates a disposable life time that manages disposables.
 */
export const getLifetime = (): DisposableLifetime => {
    const disposables: Disposable[] = [];

    let isDisposed = false;

    const add = (disposable: Disposable, options?: DisposableAdditionOptions) => {
        const { ignoreAfterDisposal } = options || { ignoreAfterDisposal: false };

        if (isDisposed) {
            if (ignoreAfterDisposal) {
                return;
            }

            throw new Error('A lifetime cannot add disposables after being disposed. Create a new lifetime instead.');
        }

        disposables.push(disposable);
    };

    const dispose = () => {
        if (!isDisposed) {
            disposables.forEach(d => d());
            isDisposed = true;
        }
    };

    return {
        add,
        dispose,
        get isDisposed() {
            return isDisposed;
        }
    };
};
