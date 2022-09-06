/**
 * Copyright (c) Microsoft. All rights reserved.
 */

declare class ResizeObserver {
    constructor(callback: IResizeObserverCallback);
    /**
     * Starts to observe an element.
     */
    public observe(target: Element): void;

    /**
     * Stop observing an element.
     */
    public unobserve(target: Element): void;

    /**
     * Disconnects the observer.
     */
    public disconnect(): void;
}

/**
 * The watch result entry
 */
interface IResizeObserverEntry {
    readonly target: Element;
    readonly contentRect: {
        readonly x: number;
        readonly y: number;
        readonly width: number;
        readonly height: number;
        readonly top: number;
        readonly right: number;
        readonly bottom: number;
        readonly left: number;
    };
}

declare type IResizeObserverCallback = (entries: IResizeObserverEntry[], observer: ResizeObserver) => void;

export type SizeChanged = (rect: { width: number; height: number }) => void;

/**
 * The element being watched needs to be either relative or absolute positioned.
 * @param element
 * @param callback
 */
const watchByPolyfill = (element: Element, callback: SizeChanged) => {
    let curWidth = 0;
    let curHeight = 0;

    const setSize = (width: number, height: number) => {
        const [lastWidth, lastHeight] = [curWidth, curHeight];

        [curWidth, curHeight] = [width, height];

        if (curWidth !== lastWidth || curHeight !== lastHeight) {
            callback({ width, height });
        }
    };

    const css = `position:absolute;
         left:0;
         top:-100%;
         width:100%;
         height:100%;
         margin:1px 0 0;
         border:none;
         opacity:0;
         pointer-events:none;`;

    const frame = document.createElement('iframe');
    frame.style.cssText = css;

    frame.onload = () => {
        setSize(element.clientWidth, element.clientHeight);
    };

    element.appendChild(frame);

    frame.contentWindow.onresize = () => {
        setSize(element.clientWidth, element.clientHeight);
    };

    return { unobserve: () => element.removeChild(frame) };
};

const watchByObserver = (element: Element, callback: SizeChanged) => {
    const ro = new ResizeObserver(entries => {
        const entry = entries[0];
        callback(entry.contentRect);
    });

    ro.observe(element);

    return { unobserve: () => ro.unobserve(element) };
};

export const watchResize = (<any>window).ResizeObserver ? watchByObserver : watchByPolyfill;
