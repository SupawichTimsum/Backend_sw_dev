# Massage Reservation API (Project#8)

REST API (Express + MongoDB) for reserving massage shop queues.

## Setup

1. `npm install`
2. Fill in `config/config.env` (`MONGO_URI`, `JWT_SECRET`)
3. `npm run dev`

Every endpoint accepts `?lang=th` or `?lang=en` to change the message language.
Without it, the user's profile `language` is used, then the `Accept-Language` header, then English.

Private endpoints need `Authorization: Bearer <token>`.

## Endpoints

### Auth / Profile
| Method | Route | Access | Note |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | `name, tel, email, password, role?, language?` |
| POST | `/api/v1/auth/login` | Public | `email, password` |
| GET | `/api/v1/auth/logout` | Public | clears token cookie |
| GET | `/api/v1/auth/me` | Private | view profile |
| PUT | `/api/v1/auth/updatedetails` | Private | `name, tel, email, language` |
| PUT | `/api/v1/auth/updatepassword` | Private | `currentPassword, newPassword` (returns new token) |

### Massage shops
| Method | Route | Access | Note |
| --- | --- | --- | --- |
| GET | `/api/v1/massageshops` | Public | filter / `select` / `sort` / `page` / `limit` |
| GET | `/api/v1/massageshops/:id` | Public | includes `averageRating`, `numReviews`, `reviews` |
| GET | `/api/v1/massageshops/:id/packages` | Public | massage types, duration, price |
| POST | `/api/v1/massageshops` | Admin | see body below |
| PUT | `/api/v1/massageshops/:id` | Admin | |
| DELETE | `/api/v1/massageshops/:id` | Admin | blocked if shop has active/upcoming reservations |

```json
{
  "name": "Relax Spa",
  "address": "123 Sukhumvit, Bangkok",
  "tel": "021234567",
  "openTime": "09:00",
  "closeTime": "22:00",
  "packages": [
    { "massageType": "thai", "duration": 60, "price": 400 },
    { "massageType": "oil", "duration": 90, "price": 900 }
  ]
}
```
`massageType`: `thai`, `oil`, `foot`, `aroma`, `herbal`

### Reservations
| Method | Route | Access | Note |
| --- | --- | --- | --- |
| POST | `/api/v1/massageshops/:massageShopId/reservations/preview` | Private | shows price, saves nothing |
| POST | `/api/v1/massageshops/:massageShopId/reservations` | Private | `resvDate, massageType, duration` |
| GET | `/api/v1/reservations` | Private | user: own only, admin: all |
| GET | `/api/v1/massageshops/:massageShopId/reservations` | Private | |
| GET | `/api/v1/reservations/:id` | Private | owner or admin |
| PUT | `/api/v1/reservations/:id` | Private | owner or admin, price recalculated |
| DELETE | `/api/v1/reservations/:id` | Private | owner or admin |

Rules:
- A user can have up to 3 active/upcoming reservations (admin has no limit).
- `resvDate` must be in the future, and the whole massage must fit in the shop opening hours (`SHOP_TIMEZONE`).
- Price comes from the shop package, never from the request body.
- Admin may send `user` in the body to reserve for another user, and may record past dates.

### Reviews
| Method | Route | Access | Note |
| --- | --- | --- | --- |
| GET | `/api/v1/massageshops/:massageShopId/reviews` | Public | with average rating |
| GET | `/api/v1/reviews` , `/api/v1/reviews/:id` | Public | |
| POST | `/api/v1/massageshops/:massageShopId/reviews` | Private | `rating (1-5), comment` |
| PUT / DELETE | `/api/v1/reviews/:id` | Private | owner or admin |

Only a user who has a reservation at that shop which has already started can review it, once per shop.

### Favorites
| Method | Route | Access |
| --- | --- | --- |
| GET | `/api/v1/favorites` | Private |
| POST | `/api/v1/favorites/:massageShopId` | Private |
| DELETE | `/api/v1/favorites/:massageShopId` | Private |

### Notifications (in-app reminder)
| Method | Route | Access | Note |
| --- | --- | --- | --- |
| GET | `/api/v1/notifications` | Private | `?unread=true` |
| PUT | `/api/v1/notifications/:id/read` | Private | |
| PUT | `/api/v1/notifications/read-all` | Private | |
| DELETE | `/api/v1/notifications/:id` | Private | |

A background job runs every `NOTIFY_CHECK_INTERVAL_MINUTES` and creates a reminder for each reservation
starting within `NOTIFY_BEFORE_HOURS`. Calling `GET /notifications` also checks right away.
