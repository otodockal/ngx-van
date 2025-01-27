<p align="center">
 <img width="300px" src="./apps/playground/src/assets/logo.png">
</p>

# \<ngx-van\>: The Navigation Section element with built-in Mobile Superpowers

> Tiny replacement for HTML nav element with mobile side nav menu built-in. Good old nav element on desktop, sliding side nav on mobile. No duplication.

## Installation

```bash
npm install ngx-van
```

## Demo

-   [Vertical menu, \<ngx-van side="start"\>](https://stackblitz.com/edit/stackblitz-starters-pddasj3g?file=src%2Fmain.ts)

## TS

```ts
import { NgxVan, NgxVanItem, NgxVanTrigger } from 'ngx-van';
```

## HTML

```angular
<button [ngxVanTrigger]="van">
    <mat-icon>{{ van.api.isOpen() ? 'close' : 'menu' }}</mat-icon>
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
                @if (van.api.nav() === 'desktop') {
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

-   Required CSS for mobile navigation styling
-   Add the following snippet to your global `styles.scss` file
-   Customize the styles to match your design system

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

-   Add this CSS snippet to prevent the desktop navigation from briefly appearing on mobile devices during server-side rendering
-   Only required when using Server-Side Rendering (SSR)

```scss
.ngx-van-ssr {
    @media screen and (max-width: 991px) {
        display: none;
    }
}
```
