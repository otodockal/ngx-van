import { computed, Signal, untracked } from '@angular/core';
import { NavSide, NavType, NavState } from './ngx-van';

/**
 * Style for mobile nav
 */
export function style(nav: Signal<NavType>, side: Signal<NavSide>) {
    return computed(() => {
        if (nav() === 'mobile') {
            return untracked(side) === 'end'
                ? 'position: fixed; right: 0; transform: translate3d(100%, 0, 0)'
                : 'position: fixed; left: 0; transform: translate3d(-100%, 0, 0)';
        }
        return null;
    });
}

/**
 * Style for mobile nav transform
 */
export function styleTransform(navState: Signal<NavState>, side: Signal<NavSide>) {
    return computed(() => {
        switch (navState()) {
            case 'openRight':
            case 'openLeft':
                return 'translate3d(0, 0, 0)';
            case 'closeRight':
                return 'translate3d(100%, 0, 0)';
            case 'closeLeft':
                return 'translate3d(-100%, 0, 0)';
            default:
                return untracked(side) === 'end'
                    ? 'translate3d(100%, 0, 0)'
                    : 'translate3d(-100%, 0, 0)';
        }
    });
}
