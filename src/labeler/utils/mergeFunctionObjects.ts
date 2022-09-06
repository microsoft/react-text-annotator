/**
 * Copyright (c) Microsoft. All rights reserved.
 */

/**
 * Takes in a list of objects with functions inside.
 * Batches functions with the same name in one function call.
 */
export const mergeFunctionObjects = <T extends Record<string, (...params: any[]) => void>>(
    listenersRecord: T,
    ...listenersRecords: Partial<T>[]
): T => {
    const obj: Record<string, ((...params: any[]) => void)[]> = {};
    [listenersRecord, ...listenersRecords].forEach(listeners => {
        for (const [name, func] of Object.entries(listeners)) {
            if (obj[name]) {
                obj[name].push(func);
            } else {
                obj[name] = [func];
            }
        }
    });

    return <T>Object.entries(obj).reduce(
        (acc, [name, funcs]) => ({
            ...acc,
            [name]: (...params: any[]) => {
                funcs.forEach(func => func.call(undefined, ...params));
            }
        }),
        <T>{}
    );
};
