# Independent deployment

Use Node 22.13+, npm ci, npm run typecheck, npm test and npm run build.
Keep the maintained Vinext/Sites Worker adapter.
.openai/hosting.json declares d1: DB and an independent project_id.
No R2 bucket, paid AI service or external code execution service is needed.

Publish the pushed source commit and its packaged Worker artifact with connected
Sites tools. The host provisions the database and applies the Drizzle schema-only
migration. Sign-in is handled by trusted Sites dispatch; user IDs are stable per
Site. The application checks the identity and learner owner for every write.

Local framework development can use npm run dev -- --port 3102 --hostname
127.0.0.1. Build first, then apply each unapplied SQL migration with:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_tan_sleeper.sql
```

The default lightweight runner is simpler: it applies migrations automatically to
its separate local SQLite database. Both local runners simulate identity only for
loopback use; public deployments require the real platform authentication boundary.
Backups, retention and recovery procedures should precede a broad public launch.
