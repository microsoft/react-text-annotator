/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { getTooltipDirections } from '../../../../components/svgRenderers/utilities/TooltipRenderer';

describe('TooltipRenderer unit test', () => {
    beforeEach(() => {
        global.innerWidth = 1500;
        global.innerHeight = 1500;
    });

    it('should get tooltip directions correctly to right', () => {
        const directions = getTooltipDirections(50, 50);

        expect(directions).toMatchObject({
            top: '55px',
            left: '50px'
        });
    });

    it('should get tooltip directions correctly to left', () => {
        const directions = getTooltipDirections(1480, 50);

        expect(directions).toMatchObject({
            top: '55px',
            right: '25px'
        });
    });

    it('should get tooltip directions correctly to top', () => {
        const directions = getTooltipDirections(50, 1480);

        expect(directions).toMatchObject({
            left: '50px',
            bottom: '45px'
        });
    });
});
