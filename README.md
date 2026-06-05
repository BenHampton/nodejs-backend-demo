## NodeJS Sandbox - Learning NodeJS

#### personal machine:

- nvm use 22.22.3

- app.js - Express app setup (NO listen here)
- server.js - Entry point: starts HTTP + WebSocket

### Middleware order (read top-to-bottom)

- Middleware runs in the order you register it with app.use(). This isn't a suggestion — it's a strict sequence. If you put the JSON body parser after your route handler, your handler can't read the request body. If you put the error handler anywhere but last, it won't catch errors from later middleware.
- Correct order for a production Express app:

1. Security headers — always first, protects every response

```
app.use(helmet());
```

2. CORS — must come before routes so preflight requests work

```
app.use(cors({ origin: [...], credentials: true }));
```

3. Body parsing — turns raw bytes into req.body

```
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
```

4. Logging — structured JSON logs for every request

```
app.use(pinoHttp({ logger }));
```

5. Rate limiting — throttles before hitting your routes

```
app.use('/api', rateLimiter);
```

6. Routes — your actual API endpoints

```
app.use('/api', routes);
```

7. 404 handler — catches anything that didn't match a route

```
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
```

8. Error handler — MUST be last, MUST have 4 params

```
app.use(errorHandler);
```

### Error Handling

#### Production apps use 4 patterns together. Here they are, in order:

1. Custom App Error Class
   - JS built-in `Error` class had no concept of HTTP status codes. When your service detects "user not found," you need to throw an error that carries a 404 status. `AppError.js` solves this
2. Operational vs Programmer Error
   - Operational (expected). Return a clear, specific error message with the correct HTTP status code. These are normal, they happen in healthy apps.
   - Programmer (bugs). Log the full error with stack trace. Returns generic "Internal Server Error" error.
3. Global Error Handler
   - Every error from every route, service, and middleware funnels through this one function. It handles operational errors with specific messages, hides programmer error details, normalizes common error types (JWT errors, Prisma constraint violations), and logs server errors for debugging.
4. The Complete Error Flow
   - Example of user not found:

```
// Example of user not found:

Service throws AppError('Not found', 404) →
asyncHandler catches the rejection →
calls next(err) →
errorHandler checks isOperational →
res.status(404).json({ error: 'Not found' })


// Example of programmer error (bug):

Service: user.name.toUpperCase() → TypeError! →
asyncHandler catches the rejection →
calls next(err) →
errorHandler: no isOperational flag → 500 →
logger.error(full stack trace) →
res.status(500).json({ error: 'Internal Server Error' })
```

### JWT

- prints a 64-character hex string (32 random bytes):

```
node -e "const c=require('crypto');console.log('JWT_ACCESS_SECRET='+c.randomBytes(32).toString('hex'));console.log('JWT_REFRESH_SECRET='+c.randomBytes(32).toString('hex'))"
```

### Prisma

- `npx prisma format`
- `npx prisma migrate dev --name init`: creates the database tables for the first time, it takes your `schema.prisma` and makes the real Postgres database match it
- `npx prisma generate`: It reads `schema.prisma` and writes the typed Prisma Client into `src/generated/prisma`
- `prisma migrate dev`: apply changes to database
- `npx prisma studio`: look at the tables
- Locally, you edit schema.prisma then run migrate dev --name <change> — it creates the migration, applies it to your DB, and auto-runs generate for you, so you rarely call generate by hand. You commit the migration files. Then on any other machine (fresh clone, CI, Docker, production), you run generate (because the client code is gitignored and missing) and migrate deploy (to apply the committed migrations to that database). So: migrate dev authors locally, migrate deploy applies elsewhere, and generate rebuilds the client code wherever it's missing.
