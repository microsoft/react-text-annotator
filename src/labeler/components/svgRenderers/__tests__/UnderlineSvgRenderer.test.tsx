/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { UnderlineSvgRenderer, UnderlineSvgRendererProps } from '../../../components/svgRenderers/shapes/UnderlineSvgRenderer';
import { NameSvgRenderer } from '../../../components/svgRenderers/utilities/NameSvgRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { noopUndefined, Point } from '../../../types/labelerTypes';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';

describe('UnderlineSvgRenderer unit tests', () => {
    const mockLabelerStore = new LabelerStore();
    const getNameSvgRenderer = (wrapper: ReactWrapper) => wrapper.find(NameSvgRenderer);

    const mockLinePoints: [Point, Point][] = [
        [
            { x: 10, y: 20 },
            { x: 15, y: 20 }
        ]
    ];

    const underlineSvgRendererProps: UnderlineSvgRendererProps = {
        endLine: 0,
        color: 'red',
        startLine: 0,
        endToken: 10,
        startToken: 5,
        kind: 'underline',
        namePosition: 'start',
        onClick: noopUndefined,
        name: '7ammo underline',
        linePoints: mockLinePoints
    };

    const UnderlineWrapper = () => (
        <LabelerMockProvider labelerStore={mockLabelerStore}>
            <UnderlineSvgRenderer {...underlineSvgRendererProps} />
        </LabelerMockProvider>
    );

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should hide underline name correctly when isAnnotationHidden is true in config store', () => {
        mockLabelerStore.configStore.setAreAnnotationNamesHidden(true);

        const wrapper = mount(<UnderlineWrapper />);

        const nameSvgRenderer = getNameSvgRenderer(wrapper);

        expect(nameSvgRenderer).toEqual({});
    });

    it('should show underline name correctly when isAnnotationHidden is false in config store', () => {
        mockLabelerStore.configStore.setAreAnnotationNamesHidden(false);

        const wrapper = mount(<UnderlineWrapper />);

        const nameSvgRenderer = getNameSvgRenderer(wrapper);

        expect(nameSvgRenderer.length).toBeGreaterThan(0);
    });
});
