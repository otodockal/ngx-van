import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

export const ngxVanAnimations = trigger('nav', [
    state('openLeft', style({ transform: 'translateX(0)' })),
    state('closeLeft', style({ transform: 'translateX(-100%)' })),

    state('openRight', style({ transform: 'translateX(0)' })),
    state('closeRight', style({ transform: 'translateX(100%)' })),

    transition('* <=> *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
]);
