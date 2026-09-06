# Ghana pilot readiness

This repository is ready for a controlled software pilot. It is not approval for public biometric payments.

## Completed in the repository

- React merchant terminal with enrollment and payment flows
- Ghana cedi (`GHS`) display and new-user currency default
- Merchant-scoped transaction history
- Payment idempotency keys to prevent duplicate charges on retries
- Full refunds with customer balance restoration
- Audit events for completed payments and refunds
- Timeout, network, biometric, PIN, inactive-account, and insufficient-balance feedback
- Safe database verification and reconciliation commands
- Automated backend tests and production builds

## Local setup

```powershell
npm install
npm run db:verify
npm run dev
```

In another terminal:

```powershell
npm run dev:web
```

Open `http://localhost:5173`.

For an existing database with the original tables already present:

```powershell
npm run db:reconcile
npm run db:verify
```

The reconciliation command refuses to continue when the base tables are missing or migration metadata is ambiguous. It does not drop tables or delete data.

## Pilot test sequence

1. Register a test merchant and save the returned API key.
2. Open the dashboard and click `Load demo data`.
3. Use `Enroll customer` to create a consenting test customer.
4. Switch to `Take payment` and process a small test amount.
5. Refresh merchant history.
6. Refund the completed payment.
7. Confirm the customer balance was restored and the transaction is marked refunded.
8. Repeat with wrong PIN, wrong template, insufficient balance, timeout, and duplicate submission cases.

Do not use demo templates or real biometric data in a public or production environment.

## External handoff required before launch

### Scanner vendor

Select one exact model and obtain its SDK, operating-system support, template format, licensing terms, liveness/anti-spoofing capability, and local Ghana support. The adapter must implement:

```ts
window.biometricTerminal.capture(fingerPosition): Promise<string>
```

The SDK adapter must return a vendor-generated template, never a raw fingerprint image. The vendor must document whether matching happens on the device, in a local service, or in a controlled backend service.

### Ghana launch review

Obtain professional review for:

- Ghana Data Protection Commission requirements
- Biometric consent, retention, deletion, and breach procedures
- Bank of Ghana and payment-partner requirements for real money
- Customer terms, merchant terms, refunds, disputes, and support
- Hosting and backup location requirements

### Production operations

Before public use, add HTTPS, secret management, API-key rotation/revocation, monitoring, backups, incident response, security testing, scanner failure procedures, a non-biometric fallback, and transaction limits.
