# Independent deployment

Use Node 22.13+, npm ci, npm run typecheck, npm test and npm run build.
Keep the maintained Vinext/Sites Worker adapter.
.openai/hosting.json declares d1: DB and an independent project_id.
No R2 bucket, paid AI service or external code execution service is needed.

Publish the pushed source commit and its packaged Worker artifact with connected
Sites tools. The host provisions the database and applies the Drizzle schema-only
migrations, including the owner-session and site-settings migration. Member sign-in
is handled by trusted Sites dispatch; user IDs are stable per Site. The application
checks the identity and learner owner for every write.

The selected public audience allows visitors to play Fruit friends and see locked
previews. Signing up unlocks everything free. The application owner dashboard is
separate from the hosting audience and remains protected at `/admin`.

Before publication configure `OWNER_EMAIL` and the salted `OWNER_PASSWORD_HASH`
as secret runtime environment values through Sites. Never place a plaintext
password or its hash in tracked source or client-side build variables. The local
`scripts/configure-owner.mjs` helper writes only ignored `.env.local` values.
`ADMIN_USER_IDS` can additionally authorize trusted platform identities. The
dashboard can save future pricing drafts; billing remains inactive until an
actual provider and verified payment handling have been implemented.

Local framework development can use npm run dev -- --port 3102 --hostname
127.0.0.1. Build first, then apply each unapplied SQL migration with:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_tan_sleeper.sql
```

The default lightweight runner is simpler: it applies migrations automatically to
its separate local SQLite database. Its development sign-in is a member; opt-in
`LOCAL_DEVELOPMENT_OWNER=1` is limited to isolated local testing. Local identity
simulation must stay on loopback. Public deployments use the platform identity
boundary and the separate configured owner login.
