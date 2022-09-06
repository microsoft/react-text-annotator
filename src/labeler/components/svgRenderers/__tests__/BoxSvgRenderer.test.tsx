/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { BoxSvgRenderer } from '../../../components/svgRenderers/shapes/BoxSvgRenderer';
import { NameSvgRenderer } from '../../../components/svgRenderers/utilities/NameSvgRenderer';
import { ResizeKnobsSvgRenderer } from '../../../components/svgRenderers/utilities/ResizeKnobsSvgRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { ISvgRendererProps, noopUndefined, Point } from '../../../types/labelerTypes';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';

describe('BoxSvgRenderer unit tests', () => {
    const getNameSvgRenderer = (wrapper: ReactWrapper) => wrapper.find(NameSvgRenderer);
    const getResizeKnobsSvgRenderer = (wrapper: ReactWrapper) => wrapper.find(ResizeKnobsSvgRenderer);

    const mockLinePoints: [Point, Point][] = [
        [
            { x: 10, y: 20 },
            { x: 15, y: 20 }
        ],
        [
            { x: 15, y: 20 },
            { x: 15, y: 25 }
        ],
        [
            { x: 15, y: 25 },
            { x: 10, y: 25 }
        ],
        [
            { x: 10, y: 25 },
            { x: 10, y: 20 }
        ]
    ];

    const boxSvgRendererProps: ISvgRendererProps = {
        endLine: 0,
        kind: 'box',
        color: 'red',
        endToken: 10,
        startLine: 0,
        startToken: 5,
        name: '7ammo box',
        namePosition: 'start',
        onClick: noopUndefined,
        linePoints: mockLinePoints
    };

    const BoxWrapper = (props: { labelerStore: LabelerStore }) => (
        <LabelerMockProvider labelerStore={props.labelerStore}>
            <BoxSvgRenderer {...boxSvgRendererProps} />
        </LabelerMockProvider>
    );

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should calculate name origin point and name width correctly', () => {
        const mockLabelerStore = new LabelerStore();
        const wrapper = mount(<BoxWrapper labelerStore={mockLabelerStore} />);

        const nameOriginPoint = getNameSvgRenderer(wrapper).prop('topLeftBasePoint');
        const nameWidth = getNameSvgRenderer(wrapper).prop('width');

        expect(nameOriginPoint).toEqual({ x: 10, y: 10 });
        expect(nameWidth).toEqual(5);
    });

    it('should calculate Knob coordinates correctly', () => {
        const mockLabelerStore = new LabelerStore();
        const wrapper = mount(<BoxWrapper labelerStore={mockLabelerStore} />);

        const knobCoordinates = getResizeKnobsSvgRenderer(wrapper).prop('coordinates');

        expect(knobCoordinates).toEqual([
            { point: { x: 10, y: 20 }, position: 'start' },
            { point: { x: 15, y: 25 }, position: 'end' }
        ]);
    });

    it('should calculate Knob coordinates correctly when isRtl is true', () => {
        const mockLabelerStore = new LabelerStore({ initialConfigs: { isRtl: true } });
        const wrapper = mount(<BoxWrapper labelerStore={mockLabelerStore} />);

        const knobCoordinates = getResizeKnobsSvgRenderer(wrapper).prop('coordinates');

        expect(knobCoordinates).toEqual([
            { point: { x: 15, y: 20 }, position: 'start' },
            { point: { x: 10, y: 25 }, position: 'end' }
        ]);
    });

    it('should hide box name correctly when isAnnotationHidden is true in config store', () => {
        const mockLabelerStore = new LabelerStore();
        mockLabelerStore.configStore.setAreAnnotationNamesHidden(true);

        const wrapper = mount(<BoxWrapper labelerStore={mockLabelerStore} />);

        const nameSvgRenderer = getNameSvgRenderer(wrapper);

        expect(nameSvgRenderer).toEqual({});
    });

    it('should show box name correctly when isAnnotationHidden is false in config store', () => {
        const mockLabelerStore = new LabelerStore();
        mockLabelerStore.configStore.setAreAnnotationNamesHidden(false);

        const wrapper = mount(<BoxWrapper labelerStore={mockLabelerStore} />);

        const nameSvgRenderer = getNameSvgRenderer(wrapper);

        expect(nameSvgRenderer.length).toBeGreaterThan(0);
    });
});
