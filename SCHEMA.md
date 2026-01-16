# Firestore Schema

## Collections

### `users`
- `id` (string): User ID (same as Auth UID)
- `phoneNumber` (string): User's phone number
- `location` (GeoPoint): User's last known location
- `address` (string): Human readable address
- `fcmToken` (string): For push notifications
- `createdAt` (timestamp)

### `products`
- `id` (string): Auto-generated
- `name` (string)
- `description` (string)
- `price` (number)
- `image` (string): URL to Firebase Storage
- `category` (string)
- `inStock` (boolean)
- `quantity` (number): Available quantity
- `unit` (string): e.g., 'kg', 'pcs'

### `orders`
- `id` (string): Auto-generated
- `userId` (string)
- `items` (array of objects):
  - `productId` (string)
  - `name` (string)
  - `quantity` (number)
  - `price` (number)
- `totalAmount` (number)
- `status` (string): 'pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'
- `paymentMethod` (string): 'COD', 'UPI'
- `paymentStatus` (string): 'pending', 'paid'
- `location` (GeoPoint): Delivery location
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `payments`
- `id` (string): Auto-generated
- `orderId` (string)
- `userId` (string)
- `amount` (number)
- `method` (string): 'UPI', 'COD'
- `status` (string): 'success', 'failure', 'pending'
- `transactionId` (string): UPI transaction ID
- `timestamp` (timestamp)
