# Deployment

Railway and Render are suitable PaaS options for this service because both provide Node.js deployment, managed PostgreSQL, secrets, health/log views, and custom domains. The container in `Dockerfile` is ready for either platform.

## Required production variables

Set these as platform secrets/environment variables:

- `NODE_ENV=production`
- `DB_URL` with the managed PostgreSQL connection string
- `API_SECRET_KEY` with at least 32 random characters
- `PORT` supplied by the platform, commonly `3000`
- `TRUSTED_MERCHANT_DOMAINS` as a comma-separated list of exact HTTPS merchant origins
- Optional: `SENTRY_DSN`, `DB_POOL_MAX`, `DB_IDLE_TIMEOUT_MS`, `DB_CONNECTION_TIMEOUT_MS`

## Release sequence

Run the migration as a release/pre-deploy command:

```bash
npm run db:migrate
```

Start the service with:

```bash
npm start
```

Do not run the test database creation script or raw SQL against production. Migrations are versioned in `migrations/` and should run once per release before the application process starts.

For a VPS, run the same image behind Nginx with TLS termination and keep PostgreSQL on a private network. Restrict the database firewall to the application network and use a managed secret store for `DB_URL` and `API_SECRET_KEY`.