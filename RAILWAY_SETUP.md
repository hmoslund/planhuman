# Railway persistent storage (SQLite) — setup guide

This app stores its data in a **SQLite** database file. Railway containers use
**ephemeral storage**, so by default the database would be wiped on every
redeploy/restart. To keep user data safe and persistent, attach a **persistent
volume** and store the database file on it.

## Steps

### 1. Create and mount a volume
Create a persistent volume from the Railway dashboard:

- Open your project, click **+ New → Volume** (or right-click the canvas).
- Choose the **planhumans web service** to attach it to.
- Set the **mount path** to `/data` (a read/write directory at the absolute
  path `/data` inside the container).

> Each service can only have **one** volume, and a service **with a volume
> cannot have more than 1 replica**. Your `railway.json` already pins the start
> command; just keep replicas at 1.

### 2. Set the database URL to the volume
Add a service variable on Railway:

```
DATABASE_URL=file:/data/planhumans.db
```

The code (`src/lib/prisma.ts`) uses this path directly. If `DATABASE_URL` is
not set, it automatically falls back to `file:<RAILWAY_VOLUME_MOUNT_PATH>/planhumans.db`,
so it will also work if you only mount the volume and don't set the variable.

### 3. Schema is created automatically on startup
The volume starts empty, so the tables don't exist yet. The
`railway.json` start command runs:

```
npx prisma db push && npm start
```

This creates/updates the schema in the database file on the volume whenever the
service starts (idempotent, safe on an empty database), then boots the app.

> The Prisma client is already generated at build time (`npm run build` runs
> `prisma generate`), so no extra generate step is needed at start.

### 4. Existing local data
If you want to carry over the local `dev.db` data (the admin account, etc.),
upload it once to the volume with the CLI after the first deploy:

```
railway volume browse
railway volume files upload ./dev.db /data/planhumans.db
```

(Do this before users sign up, or re-create your admin via a new registration.)

### 5. Backups
Enable **automatic backups** on the volume (Railway → the volume → Backups) so
user data is recoverable. Also set the donation webhook secret `BMAC_SECRET`
to a strong random value.

## Security reminders
- `.env` is gitignored and `dev.db` is no longer tracked in git, so no user
  data is shipped in the repository.
- The admin account (`hmoslund@outlook.com`) uses its bcrypt password; there is
  no hardcoded password in the code.