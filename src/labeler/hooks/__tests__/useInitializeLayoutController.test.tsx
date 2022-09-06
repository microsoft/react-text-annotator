/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import * as React from 'react';
import { useInitializeLayoutController } from '../../hooks/useInitializeLayoutController';
import { LabelerStore } from '../../stores/LabelerStore';
import { LineStore } from '../../stores/LineStore';
import { TokenStore } from '../../stores/TokenStore';
import { noopUndefined } from '../../types/labelerTypes';

describe('', () => {
    const mockLabelerStore = new LabelerStore();
    const mockLineStores = [
        new LineStore(0, 1, [new TokenStore(0, 'A'), new TokenStore(1, 'A')]),
        new LineStore(1, 2, [new TokenStore(2, 'A'), new TokenStore(3, 'A')])
    ];
    const mockRef = { querySelector: noopUndefined } as any;
    const Wrapper = ({ lineStores = mockLineStores }: { lineStores?: LineStore<TokenStore>[] }) => {
        const ref = React.useRef(mockRef);

        useInitializeLayoutController({
            lineStores,
            rootRef: ref,
            a11yStore: mockLabelerStore.a11yStore,
            selectionStore: mockLabelerStore.selectionStore,
            annotationStore: mockLabelerStore.annotationStore
        });

        return <></>;
    };

    it('should initialize a11y store with correct data if the labeler is empty', () => {
        const initializeSpy = jest.spyOn(mockLabelerStore.a11yStore, 'initialize');
        mount(<Wrapper lineStores={[]} />);

        expect(initializeSpy).toHaveBeenCalled();
        expect(mockLabelerStore.a11yStore.lineCount).toEqual(0);
        expect(mockLabelerStore.a11yStore.tokenCount).toEqual(0);
        expect(mockLabelerStore.a11yStore.containerRef).toBeDefined();
    });

    it('should initialize a11y store with correct data on mount', () => {
        const initializeSpy = jest.spyOn(mockLabelerStore.a11yStore, 'initialize');
        mount(<Wrapper />);

        expect(initializeSpy).toHaveBeenCalled();
        expect(mockLabelerStore.a11yStore.lineCount).toEqual(2);
        expect(mockLabelerStore.a11yStore.tokenCount).toEqual(4);
        expect(mockLabelerStore.a11yStore.containerRef).toBeDefined();
    });

    it('should initialize selection store with the correct data on mount', () => {
        const spy = jest.spyOn(mockLabelerStore.selectionStore, 'initialize');
        mount(<Wrapper />);

        expect(spy).toHaveBeenCalled();
        expect(mockLabelerStore.selectionStore.lineCount).toEqual(2);
        expect(mockLabelerStore.selectionStore.tokenCount).toEqual(4);
    });

    it('should initialize annotation store with the correct token count on mount', () => {
        const spy = jest.spyOn(mockLabelerStore.annotationStore, 'initialize');
        mount(<Wrapper />);

        expect(spy).toHaveBeenCalledWith(4);
    });
});
