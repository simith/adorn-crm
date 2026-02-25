# Adorn Studio - API Events Documentation

## Overview

All events are sent via HTTP POST to the backend API for CRM integration and analytics tracking.

**Base URL:** `http://localhost:8000` (configurable)  
**Endpoint:** `POST /v1/events`

---

## Common Event Structure

All events share a common envelope structure:

```json
{
  "event_type": "<event_type>",
  "session_id": "<uuid>",
  "store_id": "<store_identifier>",
  "seller_id": "<seller_identifier>",
  "device_id": "<device_identifier>",
  "payload": { ... }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | string | The type of event (see below) |
| `session_id` | string | Unique session identifier (UUID) |
| `store_id` | string | Store/location identifier |
| `seller_id` | string | Sales associate identifier |
| `device_id` | string | Device identifier (e.g., "ipad_1") |
| `payload` | object | Event-specific data |

---

## Event Types

### 1. `session.started`

Triggered when a new customer try-on session begins.

**Payload:**
```json
{
  "customer_name": "Jane Doe",
  "customer_phone": "+6512345678",
  "customer_email": "jane@example.com",
  "jeweler_id": "abharana",
  "jeweler_name": "Abharana"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `customer_name` | string | Customer's name |
| `customer_phone` | string | Customer's phone number |
| `customer_email` | string | Customer's email address |
| `jeweler_id` | string | Selected jeweler's identifier |
| `jeweler_name` | string | Selected jeweler's business name |

---

### 2. `jewelry.selected`

Triggered when a customer selects a jewelry item to try on.

**Payload:**
```json
{
  "jewelry_id": "necklace_11",
  "jewelry_name": "Diamond Cascade Necklace",
  "jewelry_category": "necklace",
  "price": 45000.00
}
```

| Field | Type | Description |
|-------|------|-------------|
| `jewelry_id` | string | Unique jewelry asset identifier |
| `jewelry_name` | string | Display name of the jewelry |
| `jewelry_category` | string | Category (necklace, earring, etc.) |
| `price` | number | Price of the item (optional) |

---

### 3. `image.generated`

Triggered when a composite try-on image is generated.

**Payload:**
```json
{
  "jewelry_id": "necklace_11",
  "jewelry_name": "Diamond Cascade Necklace",
  "attire_id": "saree_red_silk",
  "attire_name": "Red Silk Saree",
  "generation_time_ms": 245
}
```

| Field | Type | Description |
|-------|------|-------------|
| `jewelry_id` | string | Jewelry item used in composite |
| `jewelry_name` | string | Display name of the jewelry |
| `attire_id` | string | Attire/saree pattern used |
| `attire_name` | string | Display name of the attire |
| `generation_time_ms` | number | Time taken to generate image (ms) |

---

### 4. `image.shared`

Triggered when a try-on image is shared with the customer.

**Payload:**
```json
{
  "channel": "whatsapp",
  "destination": "+6512345678",
  "jewelry_id": "necklace_11",
  "jewelry_name": "Diamond Cascade Necklace",
  "jeweler_id": "abharana",
  "jeweler_name": "Abharana",
  "share_status": "sent",
  "message_sid": "SM1234567890abcdef",
  "image_url": "https://storage.example.com/images/tryon_abc123.jpg"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `channel` | string | Sharing channel: "whatsapp", "email", "airdrop", "other" |
| `destination` | string | Phone number or email address |
| `jewelry_id` | string | Jewelry item in the shared image |
| `jewelry_name` | string | Display name of the jewelry |
| `jeweler_id` | string | Jeweler identifier for branding |
| `jeweler_name` | string | Jeweler business name |
| `share_status` | string | Status: "sent", "failed" |
| `message_sid` | string | WhatsApp/Twilio message SID (if applicable) |
| `image_url` | string | URL of the uploaded/shared image |

---

### 5. `session.ended`

Triggered when a customer session is closed.

**Payload:**
```json
{
  "duration_seconds": 1845,
  "items_tried": 8,
  "items_shared": 3,
  "sale_made": true,
  "sale_amount": 125000.00,
  "purchased_items": ["necklace_11", "earring_05"],
  "notes": "Customer preferred gold finish"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `duration_seconds` | number | Session duration in seconds |
| `items_tried` | number | Number of jewelry items tried on |
| `items_shared` | number | Number of images shared |
| `sale_made` | boolean | Whether a sale was completed |
| `sale_amount` | number | Total sale amount (if sale made) |
| `purchased_items` | array | List of purchased jewelry IDs |
| `notes` | string | Seller notes about the session |

---

### 6. `attire.changed`

Triggered when the customer changes the virtual attire/saree pattern.

**Payload:**
```json
{
  "attire_id": "saree_blue_silk",
  "attire_name": "Blue Silk Saree",
  "is_original": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `attire_id` | string | Attire pattern identifier |
| `attire_name` | string | Display name of the attire |
| `is_original` | boolean | Whether this is the original photo attire |

---

## Example API Call

```bash
curl -X POST http://localhost:8000/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "image.shared",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "store_id": "store_1",
    "seller_id": "seller_1",
    "device_id": "ipad_1",
    "payload": {
      "channel": "whatsapp",
      "destination": "+6512345678",
      "jewelry_id": "necklace_11",
      "jewelry_name": "Diamond Cascade Necklace",
      "jeweler_id": "abharana",
      "jeweler_name": "Abharana",
      "share_status": "sent",
      "message_sid": "SM1234567890abcdef",
      "image_url": "https://storage.example.com/images/tryon_abc123.jpg"
    }
  }'
```

---

## Response

**Success (200 OK):**
```json
{
  "status": "ok",
  "event_id": "evt_abc123"
}
```

**Error (4xx/5xx):**
```json
{
  "status": "error",
  "message": "Invalid session_id"
}
```

---

## Notes for CRM Integration

1. **Session Tracking**: Use `session_id` to group all events from a single customer visit
2. **Attribution**: `jeweler_id` allows filtering analytics by jeweler for multi-tenant demos
3. **Conversion Tracking**: Correlate `jewelry.selected` → `image.shared` → `session.ended` with `sale_made=true` for conversion funnel analysis
4. **Image Archive**: The `image_url` in `image.shared` provides direct access to shared images for customer records
5. **Real-time Sync**: Events are sent immediately; implement webhook handlers for real-time CRM updates
