# FieldPay biometric payment demo

FieldPay is a small, browser-based demonstration of a merchant payment journey. It helps people explore what a fingerprint-based payment experience could look like; it is **not a real payment system**.

## Run the demo

1. Install the project dependencies with `npm ci`.
2. Start the demo with `npm run dev:web`.
3. Open the local address printed in the terminal (usually `http://localhost:5173`).

## Try the customer journey

- Choose a sample customer and enter a payment amount in Ghana cedis (GHS).
- Select **Approve payment** and click **Simulate fingerprint payment**. The customer's demo balance goes down.
- Open **Activity** to see the payment, then click **Refund** to return the demo balance.
- Choose a fingerprint or connection failure in **Try a demo result** to see how a declined attempt is shown. Entering more than the customer's balance also demonstrates an insufficient-balance response.
- Open **Customers** to add a test customer. This stores only the name and a pretend balance in the browser.
- Click **Reset demo** to restore the sample customers and clear activity.

## Important limitations

- Fingerprint matching is simulated. The app does not access a scanner or collect fingerprint images or templates.
- Payments, customer balances, and refunds are temporary browser state. No bank, mobile-money provider, or real account is contacted, and no real money moves.
- This demo is not approved for public or production use. Real biometric hardware, a payment partner, secure server-side processing, and professional privacy, security, and regulatory reviews would be needed before a pilot.

The backend setup and deployment notes in this repository describe work that is not part of this browser-only demo.
