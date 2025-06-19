import { useCallback, useRef, useSyncExternalStore } from 'react';
import { BehaviorSubject, distinctUntilChanged, map, OperatorFunction, skip } from 'rxjs';

export function useBehavior<T>(s: BehaviorSubject<T>): T;
export function useBehavior<T>(s: BehaviorSubject<T> | undefined): T | undefined;
export function useBehavior<T>(s: BehaviorSubject<T> | undefined): T | undefined {
    const debug = (action: string, data?: any) => {
        // Only log significant state changes
        if (action === 'value changed') {
            console.log(`[useBehavior] ${action}`, { subject: s?.constructor.name, value: data });
        }
    };

    return useSyncExternalStore(
        useCallback(
            (callback: () => void) => {
                if (!s) {
                    return () => {};
                }
                const sub = s.pipe(skip(1)).subscribe((value) => {
                    //debug('value changed', value);
                    callback();
                });
                return () => {
                    sub?.unsubscribe();
                };
            },
            [s]
        ),
        useCallback(() => s?.value, [s])
    );
}

export function useBehaviorProp<T, V>(
    s: BehaviorSubject<T>,
    p: (v: T) => V,
    operators?: OperatorFunction<V, V>[],
    cmp?: (a: V, b: V) => boolean
): V;
export function useBehaviorProp<T, V>(
    s: BehaviorSubject<T> | undefined,
    p: (v: T) => V,
    operators?: OperatorFunction<V, V>[],
    cmp?: (a: V, b: V) => boolean
): T | undefined;
export function useBehaviorProp<T, V>(
    s: BehaviorSubject<T> | undefined,
    p: (v: T) => V,
    operators?: OperatorFunction<V, V>[],
    cmp?: (a: V, b: V) => boolean
): T | undefined {
    const fns = useRef<{ p: (v: T) => V; cmp?: (a: V, b: V) => boolean; operators?: OperatorFunction<V, V>[] }>({
        p,
        operators,
        cmp,
    });
    fns.current.p = p;
    fns.current.operators = operators;
    fns.current.cmp = cmp;

    return useSyncExternalStore(
        useCallback(
            (callback: () => void) => {
                if (!s) {
                    return () => {};
                }
                const sub = s
                    .pipe(
                        skip(1),
                        map(fns.current.p),
                        distinctUntilChanged(fns.current.cmp),
                        ...((operators || []) as [])
                    )
                    .subscribe(callback)!;

                return () => sub?.unsubscribe();
            },
            [s, operators]
        ),
        useCallback(() => {
            if (!s) {
                return undefined as any;
            }
            return fns.current.p(s.value);
        }, [s])
    );
}