## NodeJS Sandbox - Learning NodeJS

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
