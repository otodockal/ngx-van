import { computed, Signal, untracked } from '@angular/core';
import { MenuSide, MenuType, NavState } from './ngx-van';

export function voidMobileStyle(menu: Signal<MenuType>, side: Signal<MenuSide>) {
    return computed(() => {
        if (menu() === 'mobile') {
            return untracked(side) === 'end'
                ? 'right: 0; transform: translateX(100%)'
                : 'left: 0; transform: translateX(-100%)';
        }
        return null;
    });
}

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
