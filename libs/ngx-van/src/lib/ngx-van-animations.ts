import { computed, Signal, untracked } from '@angular/core';
import { MenuSide, MenuType, NavState } from './ngx-van';

/**
 * Style for mobile menu
 */
export function style(menu: Signal<MenuType>, side: Signal<MenuSide>) {
    return computed(() => {
        if (menu() === 'mobile') {
            return untracked(side) === 'end'
                ? 'position: fixed; right: 0; transform: translateX(100%)'
                : 'position: fixed; left: 0; transform: translateX(-100%)';
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
                return 'translateX(0)';
            case 'closeRight':
                return 'translateX(100%)';
            case 'closeLeft':
                return 'translateX(-100%)';
            default:
                return untracked(side) === 'end' ? 'translateX(100%)' : 'translateX(-100%)';
        }
    });
}
