/**
 * Demo bag contents.
 *
 * The Catalog microfrontend will eventually push real products into the cart
 * store; until then these three lines stand in for it. Each entry mirrors the
 * shape the cart store expects, so swapping the source later needs no changes
 * anywhere else.
 */

const photo = (id, width = 700) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

export const SAMPLE_CART_ITEMS = [
  {
    id: 'elan-bomber-rust-m',
    productId: 'ELN-OUT-104',
    name: 'Tailored Bomber Jacket',
    category: 'Outerwear',
    color: 'Rust',
    size: 'M',
    price: 189,
    originalPrice: 240, // the one discounted line in the demo bag
    quantity: 1,
    image: photo('1591047139829-d91aecb6caea'),
    imageAlt: 'Rust-coloured tailored bomber jacket on a wooden hanger',
  },
  {
    id: 'elan-satin-midi-s',
    productId: 'ELN-DRS-221',
    name: 'Satin Off-Shoulder Midi Dress',
    category: 'Dresses',
    color: 'Plum',
    size: 'S',
    price: 148,
    originalPrice: null,
    quantity: 1,
    image: photo('1566174053879-31528523f8ae'),
    imageAlt: 'Model wearing a plum satin off-shoulder midi dress',
  },
  {
    id: 'elan-chain-crossbody',
    productId: 'ELN-BAG-078',
    name: 'Chain-Strap Leather Crossbody',
    category: 'Bags',
    color: 'Blush',
    size: null, // one size — the UI hides the size row when it is null
    price: 96,
    originalPrice: null,
    quantity: 1,
    image: photo('1566150905458-1bf1fc113f0d'),
    imageAlt: 'Blush leather crossbody bag with a gold chain strap',
  },
]

export function createSampleCart() {
  return SAMPLE_CART_ITEMS.map((item) => ({ ...item }))
}
