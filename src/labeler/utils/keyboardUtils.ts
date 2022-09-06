/**
 * Copyright (c) Microsoft. All rights reserved.
 */

export const ctrlKey = (e: KeyboardEvent) => e.ctrlKey || e.metaKey;
export const undoKey = (e: KeyboardEvent) => ctrlKey(e) && !e.shiftKey && e.key.toLowerCase() === 'z';
export const redoKey = (e: KeyboardEvent) => ctrlKey(e) && e.shiftKey && e.key.toLowerCase() === 'z';
export const selectAllKey = (e: KeyboardEvent) => ctrlKey(e) && e.key.toLowerCase() === 'a';
export const copyKey = (e: KeyboardEvent) => ctrlKey(e) && e.key.toLowerCase() === 'c';
