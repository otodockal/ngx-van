import { computed, Signal, untracked } from '@angular/core';
import { MenuSide, MenuType, NavState } from './ngx-van';

/**
 * Style for mobile menu
 */
export function style(menu: Signal<MenuType>, side: Signal<MenuSide>) {
    return computed(() => {
        if (menu() === 'mobile') {
            return untracked(side) === 'end'
                ? 'position: fixed; right: 0; transform: translate3d(100%, 0, 0)'
                : 'position: fixed; left: 0; transform: translate3d(-100%, 0, 0)';
        }
        return null;
    });
}

/**
 * Style for mobile menu transform
 */
export function styleTransform(navStates: Signal<NavState>, side: Signal<MenuSide>) {
    return computed(() => {
        switch (navStates()) {
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
