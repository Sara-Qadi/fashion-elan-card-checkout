# ELAN — Cart & Checkout Microfrontend

A polished, responsive **Shopping Bag and Checkout** experience for **ELAN**, a fictional fashion
& apparel marketplace. Built with Vue 3, Vuetify 3 and Vite.

> **This is one independently deployed microfrontend.**
> Shell integration has **not** been implemented yet, and the final integration method
> (Module Federation, single-spa, Web Components, iframes…) **will be selected by the group later**.
> Payment is **completely mocked** — **no real transaction occurs** and there is no backend.

---

## 1. Project description

ELAN is a Team 1 university microfrontend project. The full storefront is split across three
independently built and deployed frontends, each using a different framework:

| # | Area | Owner |
|---|------|-------|
| 1 | Catalog & Discovery — home, product listing, search, filters, product details | Team member 1 |
| 2 | **Cart & Checkout — this repository** | **Team member 2** |
| 3 | Account & Orders — login/register, profile, order history, reviews, wishlist | Team member 3 |

This repository contains **only** area 2. It runs and deploys completely on its own.

## 2. My assigned responsibility

The complete post-basket customer journey:

```
Shopping Bag  →  Shipping information  →  Payment (mocked)  →  Review order  →  Order confirmation
```

Explicitly **out of scope** for this repository: product catalog, search, filters, product detail
pages, login/register, profiles, order history, wishlist, reviews, the shell application, and the
microfrontend integration mechanism itself.

## 3. Features

**Shopping bag**
- Three realistic sample fashion products (image, category, colour, size, unit price, quantity)
- One discounted line showing the original price and a saving badge
- Increase / decrease quantity (never below 1, capped at 10) and remove with a confirmation dialog
- Live totals on every change
- Empty-bag state with a friendly message and a **Restore demo bag** action
- Promo code `ELAN10` — case-insensitive, cannot be applied twice, removable
- Order summary: subtotal, discount, shipping, tax, grand total, plus free-shipping progress

**Checkout**
- Visible 3-step progress indicator; completed steps are clickable to go back
- Shipping form with practical inline validation, trimming, and accessible labels
- Standard ($8, 3–5 business days) and Express ($18, 1–2 business days) delivery
- Mocked card payment with formatting, Luhn check, expiry/CVV validation and a brand indicator
- Cash on Delivery alternative that hides all card fields
- Full review screen with edit links back to any earlier step
- Mock order placement with loading state, duplicate-click protection, and a readable order number
- Print-friendly confirmation page with a **Print Receipt** button

**Engineering**
- Route guards so a step can never be reached before its prerequisites exist
- All money rules centralised in one module; no hard-coded totals anywhere
- Defensive `localStorage` layer that survives corrupted or missing data
- Provisional CustomEvent integration boundary for the future shell

## 4. Technology stack

| Purpose | Choice |
|---------|--------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| UI library | Vuetify 3 (Material Design 3) |
| Build tool | Vite 6 |
| Routing | Vue Router 4 (`createWebHistory`) |
| State | Pinia 3 |
| Language | JavaScript (no TypeScript) |
| Icons | Material Design Icons (`@mdi/font`) |
| Typography | Roboto (Google Fonts) |

No other UI library is used. There is no backend and no external API.

## 5. Installation

```bash
git clone https://github.com/Sara-Qadi/fashion-elan-card-checkout.git
cd fashion-elan-card-checkout
npm install
```

Requires Node.js 18 or newer (developed on Node 22).

## 6. Run locally

```bash
npm run dev
```

Then open <http://localhost:5173> — `/` redirects to `/cart`.

## 7. Build for production

```bash
npm run build
```

Output is written to `dist/`.

## 8. Preview the production build

```bash
npm run preview
```

Serves `dist/` on <http://localhost:4173> with SPA history fallback, so deep links such as
`/checkout/review` work when refreshed.

## 9. Application routes

| Route | View | Guard |
|-------|------|-------|
| `/` | redirects to `/cart` | — |
| `/cart` | Shopping bag | none |
| `/checkout/shipping` | Shipping address + delivery method | bag must not be empty |
| `/checkout/payment` | Payment method (mocked) | bag + valid shipping details |
| `/checkout/review` | Final review and Place Order | bag + shipping + valid payment |
| `/order-confirmation` | Order confirmation | none — shows a friendly empty state if no order exists |
| `/:pathMatch(.*)*` | Not found | — |

When a guard redirects, it appends `?reason=…`, which the app turns into a readable snackbar
message before removing the query from the URL.

## 10. State management

Two Pinia stores, with a deliberate one-directional dependency (`checkout` → `cart`) so there are
no circular imports.

**`stores/cart.js`**
- State: `items`, `promoCode`, `appliedDiscount`
- Getters: `itemCount`, `subtotal`, `discountAmount`, `discountedSubtotal`, `taxAmount`, `isEmpty`,
  `hasPromoApplied`, `lineTotals`
- Actions: `incrementQuantity`, `decrementQuantity`, `updateQuantity`, `removeItem`, `clearCart`,
  `resetDemoCart`, `applyPromoCode`, `removePromoCode`

**`stores/checkout.js`**
- State: `shippingAddress`, `shippingMethodId`, `paymentMethod`, `safePaymentSummary`,
  `orderConfirmation`, `isPlacingOrder`
- Getters: `totals` (the authoritative breakdown), `shippingMethod`, `shippingCost`, `grandTotal`,
  `hasValidShipping`, `hasValidPayment`, `hasCompletedOrder`, `customerName`, `deliveryEstimate`
- Actions: `setShippingDraft`, `saveShippingAddress`, `selectShippingMethod`, `setPaymentMethod`,
  `startCheckout`, `createOrder`, `clearCheckoutAfterOrder`, `resetDemo`

### Pricing rules (all in `src/utils/pricing.js`)

| Rule | Value |
|------|-------|
| Discount | 10% of the subtotal when `ELAN10` is applied |
| Standard shipping | $8.00 — **free** once the discounted merchandise subtotal reaches $150 |
| Express shipping | $18.00 (never free) |
| Tax | 5% of the discounted merchandise subtotal |
| Grand total | discounted subtotal + shipping + tax |
| Currency | USD throughout |

Every component reads these results; no component recomputes money on its own.

## 11. Mock payment explanation

The payment step is a **frontend demonstration only**:

- No payment gateway, no Stripe, no PayPal, no backend, no network request of any kind.
- The page shows a permanent notice: *"Demo checkout — no real payment will be processed."*
- The card number is formatted as you type, restricted to a realistic length, and checked with the
  Luhn algorithm; the expiry must be a valid future `MM/YY`; the CVV length follows the card brand.
- Choosing **Cash on Delivery** hides the card fields entirely and skips card validation.

### Test promo code

```
ELAN10          →  10% off (case-insensitive, e.g. "elan10" also works)
```

Any other code shows an inline error and a snackbar.

### Test card data

```
Card number   4242 4242 4242 4242
Name on card  any name
Expiry        any future date, e.g. 09/29
CVV           any 3 digits, e.g. 123
```

## 12. LocalStorage behaviour

Three namespaced keys, all read through `src/utils/storage.js`:

| Key | Contents |
|-----|----------|
| `elan.checkout.cart.v1` | bag items, applied promo code, discount rate |
| `elan.checkout.checkout.v1` | shipping address, delivery method, payment method name, safe payment summary |
| `elan.checkout.last-order.v1` | the completed order, so `/order-confirmation` survives a refresh |

- Every read is wrapped in `try/catch`; a corrupted or hand-edited value is discarded and the app
  falls back to its defaults instead of crashing.
- If `localStorage` is unavailable (private mode, blocked storage, full quota) the app still runs —
  it simply does not persist.
- Placing an order writes the order snapshot **before** clearing the bag and checkout form, so the
  confirmation can never be lost.

### Security note

**Full card details and the CVV are never persisted, transmitted, or logged.**

- The card number and CVV live only in `CardPaymentForm.vue`'s local component state.
- They are never written to Pinia and never written to `localStorage`.
- The only payment data that leaves the form is a *safe summary*: the card brand and the last four
  digits, e.g. `{ method: 'card', label: 'Visa ending in 4242', brand: 'visa', last4: '4242' }`.
- The review and confirmation screens show only that masked value.
- No card data is written to the console, and there is no backend to send it to.

## 13. Provisional exposed browser events

The group has **not chosen an integration method yet**. Instead of guessing, every outward-facing
interaction is funnelled through one framework-independent module —
[`src/integration/checkoutBridge.js`](src/integration/checkoutBridge.js) — which currently
implements them as browser `CustomEvent`s dispatched on `window`.

| Event | When it fires |
|-------|---------------|
| `elan:cart-updated` | whenever the bag contents or totals change |
| `elan:checkout-started` | when the shopper leaves the bag for the shipping step |
| `elan:order-completed` | after a mock order is created |
| `elan:navigate-catalog` | when "Continue Shopping" is pressed (**cancelable**) |

**The app never requires a shell to be listening.** With nothing listening it behaves normally.

### Expected event payloads

```js
// elan:cart-updated
{ source: 'elan-cart-checkout', itemCount: 3, subtotal: 433, grandTotal: 454.65, currency: 'USD' }

// elan:checkout-started
{ source: 'elan-cart-checkout', itemCount: 3, grandTotal: 454.65, currency: 'USD' }

// elan:order-completed  — safe fields only
{
  source: 'elan-cart-checkout',
  orderId: 'ELN-2026-482731',
  total: 454.65,
  itemCount: 3,
  currency: 'USD',
  placedAt: '2026-08-02T20:49:48.638Z'
}

// elan:navigate-catalog  — cancelable
{ source: 'elan-cart-checkout', reason: 'continue-shopping' }   // or 'post-order'
```

**No customer or payment information is ever exposed through these events** — no name, address,
email, phone, card brand or last four digits.

Example listener a future shell could register:

```js
window.addEventListener('elan:order-completed', (e) => {
  console.log('Order placed:', e.detail.orderId, e.detail.total)
})

// Claim catalog navigation by cancelling the event:
window.addEventListener('elan:navigate-catalog', (e) => {
  e.preventDefault()          // tells this app "I handled it"
  shellRouter.push('/products')
})
```

## 14. Future integration note

These event names and payloads are **provisional and may change** once the group selects an
integration method. The point of `checkoutBridge.js` is that only that one file needs to change —
no view, store or component talks to the outside world directly.

`requestCatalogNavigation()` resolves in three steps, so wiring up the real catalog later needs no
code changes in any view:

1. A shell listener calls `event.preventDefault()` on `elan:navigate-catalog` → the shell handles it.
2. Otherwise, if the public `VITE_CATALOG_URL` variable is set, the browser navigates there.
3. Otherwise, the local fallback runs (reset the demo and return to `/cart`).

To point "Continue Shopping" at a teammate's deployed catalog, set the variable and redeploy:

```bash
# .env  (or Vercel → Settings → Environment Variables)
VITE_CATALOG_URL=https://the-catalog-microfrontend.vercel.app
```

This is public, non-secret configuration; see `.env.example`. The app has **not** been converted
into a Web Component and implements no shell, Module Federation or single-spa wiring.

## 15. Project structure

```
src/
  components/
    AppFooter.vue            AppHeader.vue            AppSnackbar.vue
    CardPaymentForm.vue      CartItem.vue             CheckoutProgress.vue
    EmptyCart.vue            OrderSummary.vue         PaymentMethodSelector.vue
    ProductThumb.vue         PromoCodeForm.vue        ReviewSection.vue
    ShippingForm.vue         ShippingMethodSelector.vue
  composables/
    useSnackbar.js           # app-wide feedback (never window.alert)
  data/
    sampleCart.js            # demo bag contents
  integration/
    checkoutBridge.js        # PROVISIONAL microfrontend boundary
  plugins/
    vuetify.js               # theme + component defaults
  router/
    index.js                 # routes + step guards
  stores/
    cart.js                  checkout.js
  styles/
    main.css                 # design-system layer over Vuetify
  theme/
    elanTheme.js             # shareable palette / radii / spacing tokens
  utils/
    currency.js  order.js  pricing.js  storage.js  validation.js
  views/
    CartView.vue             ShippingView.vue         PaymentView.vue
    ReviewOrderView.vue      OrderConfirmationView.vue NotFoundView.vue
  App.vue                    main.js
```

## 16. Design system

`src/theme/elanTheme.js` is the single source of truth for the palette, so the other Team 1
microfrontends can import or copy the same values and stay visually consistent.

| Token | Value |
|-------|-------|
| Primary | `#7B1E3A` |
| Secondary | `#C8A27A` |
| Background | `#FFF9F6` |
| Surface | `#FFFFFF` |
| Text | `#211A1D` |
| Muted text | `#6F6267` |
| Error | `#BA1A1A` |
| Card radius | 16px |
| Input radius | 12px |
| Spacing unit | 8px |

Typography is Roboto; shadows are soft and low-contrast.

## 17. Accessibility & responsiveness

- Works on desktop, tablet and mobile with no horizontal scrolling (verified down to a 320px
  content width)
- Forms stack to a single column on small screens; the order summary moves below the form
- Every input has a real label; icon-only buttons carry `aria-label`s
- The step indicator is a `<nav>` with an ordered list and `aria-current="step"`
- Semantic heading order, visible keyboard focus rings, and `prefers-reduced-motion` support
- Feedback uses Vuetify alerts, inline messages, dialogs and snackbars — never `window.alert()`

## 18. Deployment (Vercel)

The repository already contains `vercel.json` with the SPA rewrite required for route refreshes:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Option A — Vercel dashboard

1. Push this repository to GitHub.
2. Go to <https://vercel.com/new> and import `Sara-Qadi/fashion-elan-card-checkout`.
3. Vercel auto-detects Vite. Confirm the settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Press **Deploy**. No environment variables are required.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel          # preview deployment
vercel --prod   # production deployment
```

Notes:
- `base` stays `'/'` in `vite.config.js` because the app is served from the domain root.
- There are no secret environment variables and no backend dependency.
- Product photography is loaded from `images.unsplash.com`; each image falls back to an on-brand
  placeholder tile if it fails to load.

## 19. Live deployed URL

```
TODO: paste the Vercel production URL here after deploying
https://<your-project>.vercel.app
```

*Not yet deployed at the time of writing — deploy with the steps above and replace this
placeholder.*

## 20. Screenshots

Replace these placeholders with your own captures (put the files in `docs/screenshots/`):

| Screen | Image |
|--------|-------|
| Shopping bag | `![Shopping bag](docs/screenshots/cart.png)` |
| Empty bag | `![Empty bag](docs/screenshots/cart-empty.png)` |
| Shipping | `![Shipping](docs/screenshots/shipping.png)` |
| Payment | `![Payment](docs/screenshots/payment.png)` |
| Review order | `![Review](docs/screenshots/review.png)` |
| Order confirmation | `![Confirmation](docs/screenshots/confirmation.png)` |
| Mobile layout | `![Mobile](docs/screenshots/mobile.png)` |

## 21. Manual test checklist

1. Open `/cart` — three sample products, totals `$433.00` subtotal / free shipping / `$21.65` tax / `$454.65` total
2. Change quantities and remove an item — totals update immediately
3. Apply an invalid promo code — inline error plus snackbar
4. Apply `ELAN10` (or `elan10`) — discount `−$43.30`, tax `$19.49`, total `$409.19`
5. Try applying `ELAN10` twice — blocked with an explanation
6. Empty the bag — empty state appears; `/checkout/shipping` redirects back to `/cart`
7. Submit the shipping form empty — eight inline errors, navigation blocked
8. Enter an invalid email/phone — format errors appear
9. Complete valid details, choose Standard, continue
10. Enter an invalid card — Luhn/expiry/CVV errors, **Review Order** stays disabled
11. Enter `4242 4242 4242 4242` — Visa badge appears, button enables
12. Review the order, use **Edit** to return to shipping, come back
13. Tick the confirmation checkbox and press **Place Order** — loading state, then confirmation
14. Refresh `/order-confirmation` — the order is still there
15. Clear `localStorage` and open `/order-confirmation` — friendly "no order" state, no crash
16. Repeat with **Cash on Delivery** — card fields hidden, no card validation
17. Resize to a phone width — single column, no horizontal scrolling

## 22. Licence / academic note

Created for a university microfrontend coursework project. All product photography is from
Unsplash. ELAN is a fictional brand. **No real orders, payments or shipments take place.**
