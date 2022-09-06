/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import React from 'react';
import { useVirtualizer } from '../../hooks/useVirtualizer';
import { LabelerVirtualizationStore } from '../../stores/LabelerVirtualizationStore';
import { LINE_HEIGHT_CHANGE_DEBOUNCE } from '../../utils/labelerConstants';

describe('useVirtualizer unit tests', () => {
    let virtualizationStore: LabelerVirtualizationStore;
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();

    const Wrapper = (props: Partial<Parameters<typeof useVirtualizer>[0]>) => {
        const containerRef = props.containerRef || getMockContainerRef();
        useVirtualizer({ containerRef, ...(props as any), annotationDomData: props.annotationDomData ?? [], virtualizationStore });

        return <div></div>;
    };

    const getMockContainerRef = (props: Partial<HTMLDivElement> = {}): any => ({
        current: {
            offsetHeight: 300,
            scrollTop: 0,
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
            ...props
        }
    });

    const updateLineHeights = (lineCount: number) => {
        Array(lineCount)
            .fill(null)
            .forEach((_, index) => virtualizationStore.updateLineHeight(index, 100));
        jest.advanceTimersByTime(LINE_HEIGHT_CHANGE_DEBOUNCE);
    };

    beforeAll(() => jest.useFakeTimers());

    beforeEach(() => {
        virtualizationStore = new LabelerVirtualizationStore();
    });

    it('should register and unmount event listeners for scroll on mount and unmount', () => {
        const wrapper = mount(<Wrapper />);
        expect(mockAddEventListener).toHaveBeenCalledWith('scroll', expect.anything());

        wrapper.unmount();
        expect(mockRemoveEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    });

    it('should do nothing if the labeler is not mounted', () => {
        mount(<Wrapper isLabelerMounted={false} />);

        expect(virtualizationStore.startingLine).toEqual(NaN);
        expect(virtualizationStore.endingLine).toEqual(NaN);
    });

    it('should do nothing if the virtualization is not enabled', () => {
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled={false} />);

        expect(virtualizationStore.startingLine).toEqual(NaN);
        expect(virtualizationStore.endingLine).toEqual(NaN);
    });

    it('should do nothing if the there are no lines defined in the virtualization store', () => {
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled />);

        expect(virtualizationStore.startingLine).toEqual(NaN);
        expect(virtualizationStore.endingLine).toEqual(NaN);
    });

    it('should show all lines if the line heights are less than the container height', () => {
        updateLineHeights(3);
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled />);

        expect(virtualizationStore.startingLine).toEqual(0);
        expect(virtualizationStore.endingLine).toEqual(2);
    });

    it('should only render lines that fit in the container', () => {
        updateLineHeights(10);
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled />);

        expect(virtualizationStore.startingLine).toEqual(0);
        expect(virtualizationStore.endingLine).toEqual(6);
    });

    it('should only render lines that fit in the container', () => {
        updateLineHeights(10);
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled />);

        expect(virtualizationStore.startingLine).toEqual(0);
        expect(virtualizationStore.endingLine).toEqual(6);
    });

    it('should extend render lines when annotations are partially in the visible range', () => {
        const mockAnnotation: any = { lineSegments: [{ lineIndex: 5 }, { lineIndex: 9 }] };

        updateLineHeights(10);
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled annotationDomData={[mockAnnotation]} />);

        expect(virtualizationStore.startingLine).toEqual(0);
        expect(virtualizationStore.endingLine).toEqual(9);
    });

    it('should render lines visible in scroll area', () => {
        updateLineHeights(15);
        const containerRef = getMockContainerRef({ scrollTop: 500 });
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled containerRef={containerRef} />);

        expect(virtualizationStore.startingLine).toEqual(3);
        expect(virtualizationStore.endingLine).toEqual(11);
    });

    it('should render lines visible in scroll area (2)', () => {
        updateLineHeights(15);
        const containerRef = getMockContainerRef({ scrollTop: 300 });
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled containerRef={containerRef} />);

        expect(virtualizationStore.startingLine).toEqual(1);
        expect(virtualizationStore.endingLine).toEqual(9);
    });

    it('should render lines visible in scroll area and expand to account for annotations', () => {
        const mockAnnotations: any = [
            { lineSegments: [{ lineIndex: 0 }, { lineIndex: 1 }] },
            { lineSegments: [{ lineIndex: 1 }, { lineIndex: 9 }] },
            { lineSegments: [{ lineIndex: 5 }, { lineIndex: 14 }] }
        ];

        updateLineHeights(15);
        const containerRef = getMockContainerRef({ scrollTop: 500 });
        mount(<Wrapper isLabelerMounted isVirtualizationEnabled containerRef={containerRef} annotationDomData={mockAnnotations} />);

        expect(virtualizationStore.startingLine).toEqual(1);
        expect(virtualizationStore.endingLine).toEqual(14);
    });
});
