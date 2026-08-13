# Universal ID - Snacks Store (Customer App)

A snack e-commerce mobile app with "addictive" add-to-cart animations and built-in product management.

## Features

### Storefront
- **Browse Page** - Colorful 2-column product grid with 3D-tilted packaging images
- **Detail Page** - Large product view with quantity selector and stock indicator
- **Cart Page** - Dark wave-shaped container with animated item list and yellow summary card

### Animations (5 Core Effects)
1. **Fly-to-Cart** - Product image flies along a bezier curve into the cart bar
2. **Badge Pop** - Cart count badge spring-bounces on update
3. **Cart Bar Bounce** - Bottom cart bar physically bounces when item lands
4. **Thumbnail Slide-in** - New thumbnails slide into the cart bar with spring physics
5. **Cart Page Reveal** - Dark container slides up with curve animation and staggered list items

### Product Management (In-App)
- **Add Products** - Upload custom images, set name/brand/price/stock/category
- **Edit Products** - Modify any product field at any time
- **Delete Products** - Remove products from store (also removes from cart)
- **Stock Management** - Real-time stock decrement on add-to-cart, low-stock warnings, sold-out states
- **Data Persistence** - All data saved to localStorage (survives page refresh)

### Real-time Chat (New)
- **Customer Chat** - Floating chat button opens a conversation panel with the merchant
- **Real-time Messaging** - WebSocket-powered instant message delivery
- **Unread Badge** - Red badge on chat button shows unread message count
- **Message History** - Chat history persisted in localStorage
- **Smart Positioning** - Chat button automatically adjusts position to avoid the cart bar

## Tech Stack
- Pure HTML / CSS / JavaScript (no frameworks)
- localStorage for data persistence
- CSS animations + requestAnimationFrame for motion
- Base64 image encoding for uploaded product images

## Related
- Merchant Dashboard: [Universal-ID-Admin](https://github.com/dongsion/Universal-ID-Admin)

## Usage
1. Open `index.html` in a browser (or serve with any static server)
2. Browse products, tap cards for details, tap "+" to add to cart
3. Tap the menu icon (top-right) to open Product Management
4. Add/edit/delete products with custom images and pricing

## License
MIT
