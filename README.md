<p align="center">
 <img width="300px" src="./apps/playground/src/assets/logo.png">
</p>

# \<ngx-van\>: The Navigation Section element with built-in Mobile Superpowers

> Tiny replacement for HTML nav element with mobile side nav menu built-in. Good old nav element on desktop, sliding side nav on mobile. No duplication.

## Installation

```bash
npm install ngx-van
```

```bash
yarn add ngx-van
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

```html
<button [ngxVanTriggerFor]="van">
    <mat-icon>{{ van.vm.isOpen() ? 'close' : 'menu' }}</mat-icon>
</button>

<ngx-van [breakpoint]="991" [side]="'end'" #van>
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
                @if (van.vm.menu() === 'mobile') {
                    <mat-icon>delete</mat-icon>
                }
                Deleted
            </a>
        </li>
    </ul>
</ngx-van>
```

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
