# Braintree Payment Integration - Backend Setup

This document outlines the backend integration required for the Braintree Drop-in payment system and patient appointment management.

## Required Endpoints

### 1. GET /api/payments/token

This endpoint should generate and return a client token for Braintree Drop-in initialization.

**Response Format:**

JSON format (recommended):

```json
{
  "token": "your_braintree_client_token_here"
}
```

Fallback - Raw string format:

```
Content-Type: text/plain
your_braintree_client_token_here
```

**Backend Implementation Example (Node.js/Express):**

```javascript
// For sandbox environment
const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox, // Use braintree.Environment.Production for live
  merchantId: "your_merchant_id",
  publicKey: "your_public_key",
  privateKey: "your_private_key",
});

app.get("/api/payments/token", async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({});

    // JSON response (recommended)
    res.json({ token: response.clientToken });

    // Raw string response (fallback)
    // res.send(response.clientToken);
  } catch (error) {
    console.error("Error generating client token:", error);
    res.status(500).json({ error: "Failed to generate client token" });
  }
});
```

### 2. POST /api/patient/bookings

This endpoint should handle the booking creation with payment processing.

**Request Body:**

```json
{
  "scheduleId": "string",
  "appointmentDate": "2025-09-10",
  "slotStartTime": "09:15:00",
  "paymentMethodNonce": "nonce_from_braintree_dropin"
}
```

**Response:**

```json
{
  "bookingId": "string",
  "transactionId": "string",
  "status": "confirmed",
  "amount": "50.00"
}
```

**Backend Implementation Example:**

```javascript
app.post("/api/patient/bookings", async (req, res) => {
  const { scheduleId, appointmentDate, slotStartTime, paymentMethodNonce } =
    req.body;

  // Get patient ID from authenticated user session/token
  const patientId = req.user.id; // Assuming you have authentication middleware

  try {
    // 1. Validate the booking slot is still available
    const isSlotAvailable = await checkSlotAvailability(
      scheduleId,
      appointmentDate,
      slotStartTime
    );
    if (!isSlotAvailable) {
      return res.status(409).json({
        message: "Slot is no longer available",
      });
    }

    // 2. Get appointment/consultation fee (you'll need to determine this)
    const amount = "50.00"; // Example amount - get this from your business logic

    // 3. Process payment with Braintree
    const paymentResult = await gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: paymentMethodNonce,
      options: {
        submitForSettlement: true,
      },
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        message: "Payment failed: " + paymentResult.message,
      });
    }

    // 4. Create the booking in your database
    const booking = await createBooking({
      patientId,
      scheduleId,
      appointmentDate,
      slotStartTime,
      transactionId: paymentResult.transaction.id,
      amount: amount,
      status: "confirmed",
    });

    // 5. Mark the slot as booked
    await markSlotAsBooked(scheduleId, appointmentDate, slotStartTime);

    res.status(201).json({
      bookingId: booking.id,
      transactionId: paymentResult.transaction.id,
      status: "confirmed",
      amount: amount,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});
```

## Environment Variables

Add these to your environment configuration:

```env
# Braintree Sandbox
BRAINTREE_ENVIRONMENT=sandbox
BRAINTREE_MERCHANT_ID=your_sandbox_merchant_id
BRAINTREE_PUBLIC_KEY=your_sandbox_public_key
BRAINTREE_PRIVATE_KEY=your_sandbox_private_key

# For production, change BRAINTREE_ENVIRONMENT to 'production'
# and use your production keys
```

## Testing

### Test Credit Cards (Sandbox)

- **Visa**: 4111 1111 1111 1111
- **Mastercard**: 5555 5555 5555 4444
- **American Express**: 3782 8224 6310 005
- **Discover**: 6011 1111 1111 1117

Use any future expiration date and any 3-4 digit CVV.

### Quick Testing

For development/testing, you can also use the fake nonce `"fake-valid-nonce"` instead of going through the Drop-in UI.

## Error Handling

Common scenarios to handle:

1. **Slot already booked (409)**: Check availability before processing payment
2. **Payment declined (400)**: Return appropriate error message
3. **Network/server errors (500)**: Log errors and return generic message
4. **Invalid data (400)**: Validate all required fields

## Security Considerations

1. **Server-side validation**: Always validate booking data on the server
2. **Authentication**: Ensure the patient is authenticated
3. **Authorization**: Verify the patient can book appointments
4. **Payment verification**: Always verify payment success before confirming booking
5. **Idempotency**: Consider implementing idempotency keys to prevent duplicate bookings

## Database Schema Suggestions

Consider these fields for your bookings table:

```sql
CREATE TABLE bookings (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  schedule_id VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  slot_start_time TIME NOT NULL,
  transaction_id VARCHAR(255),
  amount DECIMAL(10,2),
  status ENUM('pending', 'confirmed', 'cancelled', 'completed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Additional Endpoints for Appointment Management

### 3. GET /api/patient/bookings

This endpoint should return a list of all bookings for the authenticated patient.

**Response:**

```json
[
  {
    "bookingId": 123,
    "patientName": "John Doe",
    "doctorName": "Dr. Smith",
    "dispensaryName": "City Health Dispensary",
    "appointmentDate": "2025-09-15",
    "appointmentTime": "14:30:00",
    "status": "confirmed",
    "paymentStatus": "paid"
  }
]
```

**Backend Implementation Example:**

```javascript
app.get("/api/patient/bookings", async (req, res) => {
  const patientId = req.user.id; // From authentication middleware

  try {
    const bookings = await getPatientBookings(patientId);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching patient bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});
```

### 4. POST /api/patient/{bookingId}/cancel

This endpoint should cancel a booking and process a refund if applicable.

**Query Parameters:**

- `refund` (optional, default: true) - Whether to process a refund

**Request:**

```
POST /api/patient/123/cancel?refund=true
```

**Response:**

```json
{
  "bookingId": 123,
  "status": "cancelled",
  "refundStatus": "processed",
  "refundAmount": "50.00",
  "message": "Booking cancelled successfully"
}
```

**Backend Implementation Example:**

```javascript
app.post("/api/patient/:bookingId/cancel", async (req, res) => {
  const { bookingId } = req.params;
  const { refund = true } = req.query;
  const patientId = req.user.id; // From authentication middleware

  try {
    // 1. Verify the booking belongs to the patient
    const booking = await getBookingById(bookingId);
    if (!booking || booking.patientId !== patientId) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2. Check if cancellation is allowed (before appointment day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(booking.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate <= today) {
      return res.status(400).json({
        message: "Cannot cancel appointment on or after the appointment day",
      });
    }

    // 3. Cancel the booking
    await cancelBooking(bookingId);

    // 4. Process refund if requested and payment was made
    let refundResult = null;
    if (refund && booking.transactionId) {
      refundResult = await gateway.transaction.refund(booking.transactionId);

      if (!refundResult.success) {
        // Log the error but don't fail the cancellation
        console.error("Refund failed:", refundResult.message);
      }
    }

    // 5. Free up the slot
    await freeSlot(
      booking.scheduleId,
      booking.appointmentDate,
      booking.slotStartTime
    );

    res.json({
      bookingId: booking.id,
      status: "cancelled",
      refundStatus: refundResult?.success ? "processed" : "failed",
      refundAmount: refundResult?.success ? booking.amount : null,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});
```

## Business Rules

### Date Restrictions

- **Booking**: Patients can only book appointments up to 1 week in advance
- **Cancellation**: Patients can only cancel appointments before the appointment day
- **Refunds**: Full refunds are processed for cancellations made before the appointment day

### Status Values

- **Booking Status**: `pending`, `confirmed`, `cancelled`, `completed`
- **Payment Status**: `pending`, `paid`, `refunded`, `failed`

## Next Steps

1. Set up your Braintree sandbox account
2. Implement the backend endpoints above
3. Test with the frontend component
4. Move to production environment when ready
