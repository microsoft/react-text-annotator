/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { RelationSvgRenderer, RelationSvgRendererProps } from '../../../components/svgRenderers/shapes/RelationSvgRenderer';
import { NameSvgRenderer } from '../../../components/svgRenderers/utilities/NameSvgRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { noopUndefined, Point } from '../../../types/labelerTypes';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';

describe('RelationSvgRenderer unit tests', () => {
    const mockLabelerStore = new LabelerStore();
    const getNameSvgRenderer = (wrapper: ReactWrapper) => wrapper.find(NameSvgRenderer);

    const mockLinePoints: [Point, Point][] = [
        [
            { x: 10, y: 20 },
            { x: 15, y: 20 }
        ],
        [
            { x: 15, y: 20 },
            { x: 15, y: 25 }
        ]
    ];

    const relationSvgRendererProps: RelationSvgRendererProps = {
        endLine: 0,
        startLine: 0,
        color: 'red',
        endToken: 10,
        startToken: 5,
        kind: 'relation',
        namePosition: 'start',
        name: '7ammo relation',
        onClick: noopUndefined,
        linePoints: mockLinePoints
    };

    const RelationWrapper = () => (
        <LabelerMockProvider labelerStore={mockLabelerStore}>
            <RelationSvgRenderer {...relationSvgRendererProps} />
        </LabelerMockProvider>
    );

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should hide relation name correctly when isAnnotationHidden is true in config store', () => {
        mockLabelerStore.configStore.setAreAnnotationNamesHidden(true);

        const wrapper = mount(<RelationWrapper />);

        const nameSvgRenderer = getNameSvgRenderer(wrapper);

        expect(nameSvgRenderer).toEqual({});
    });

    it('should show relation name correctly when isAnnotationHidden is false in config store', () => {
        mockLabelerStore.configStore.setAreAnnotationNamesHidden(false);

        const wrapper = mount(<RelationWrapper />);

        const nameSvgRenderer = getNameSvgRenderer(wrapper);

        expect(nameSvgRenderer.length).toBeGreaterThan(0);
    });
});
