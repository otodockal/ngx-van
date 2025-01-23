<p align="center">
 <img width="300px" src="./apps/playground/src/assets/logo.png">
</p>

# \<ngx-van\>: The Navigation Section element with built-in Mobile Superpowers

> Tiny replacement for HTML nav element with mobile side nav menu built-in. Good old nav element on desktop, sliding side nav on mobile. No duplication.

## Installation

```bash
npm install ngx-van
```

## Demos

-   [Vertical menu, \<ngx-van side="start"\>](https://stackblitz.com/edit/angular-ivy-afbbds?file=src/app/app.component.html)
-   [Vertical menu, \<ngx-van side="end"\>](https://stackblitz.com/edit/angular-ivy-51wp1y?file=src%2Fapp%2Fapp.component.html)
-   [Horizontal menu, \<ngx-van side="start"\>](https://stackblitz.com/edit/angular-ivy-yczdag?file=src%2Fapp%2Fapp.component.html)
-   [Horizontal menu, \<ngx-van side="end"\>](https://stackblitz.com/edit/angular-ivy-mqsvwt?file=src%2Fapp%2Fapp.component.html)

## TS

```ts
import { NgxVan, NgxVanItem, NgxVanTriggerFor } from 'ngx-van';
```

## HTML

```angular
<button [ngxVanTriggerFor]="van">
    <mat-icon>{{ van.vm.isOpen() ? 'close' : 'menu' }}</mat-icon>
</button>

<ngx-van
    [side]="'end'"
    [breakpoint]="991"
    [closeOnEscapeKeyClick]="'dispose'"
    [closeOnBackdropClick]="'close'"
    [transition]="'transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)'"
    #van
>
    <ul>
        <li>
            <a ngx-van-item routerLink="/inbox">Inbox</a>
        </li>
        <li>
            <a ngx-van-item routerLink="/starred">Starred</a>
        </li>
        <li>
            <a ngx-van-item routerLink="/important">Important</a>
        </li>
        <li>
            <a ngx-van-item routerLink="/drafts">Drafts</a>
        </li>
        <li>
            <a ngx-van-item routerLink="/deleted">
                @if (van.vm.menu() === 'desktop') {
                    <app-icon>delete</app-icon>
                }
                Deleted
            </a>
        </li>
    </ul>
</ngx-van>
```

## Animations

You can customize the transition animation. Here are some examples:

-   Default elastic effect: `transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)`
-   Smooth linear: `transform 300ms linear`
-   Ease in-out: `transform 350ms ease-in-out`
-   Quick snap: `transform 200ms ease-out`
-   Slow and smooth: `transform 600ms cubic-bezier(0.4, 0, 0.2, 1)`
-   Sharp acceleration: `transform 300ms cubic-bezier(0.4, 0, 1, 1)`
-   Gentle deceleration: `transform 300ms cubic-bezier(0, 0, 0.2, 1)`
-   Spring-like: `transform 450ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`
-   Bounce effect: `transform 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`

## CSS

-   CSS for mobile menu only.
-   Add snippet to style.scss. It has to be declared in the global scope.
-   Change styling according to your preferences.

```scss
.ngx-van-mobile {
    nav {
        top: 60px;
        width: 300px;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        ul {
            list-style-type: none;
            margin: 0;
            padding: 20px;
            a {
                display: flex;
                align-items: center;
                width: 100%;
                height: 50px;
                text-align: left;
                color: #fff;
            }
        }
    }
}
.ngx-van-mobile-backdrop {
    position: fixed;
    top: 60px !important;
    right: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(12px);
    background-color: rgba(0, 0, 0, 0.5);
}
```

## SSR

-   In order to prevent desktop menu flickering on mobile (when rendered on the server), add the following CSS snippet.
-   Use only if your website is SSR.

```scss
.ngx-van-ssr {
    @media screen and (max-width: 991px) {
        display: none;
    }
}
```
