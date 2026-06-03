/**
 * Wraps an async route handler so thrown errors are
 * automatically passed to Express's error handler.
 *
 * Usage:
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const data = await someService.doStuff(); // if this throws...
 *     res.json({ data }); // ...it's caught!
 *   }));
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch(next);
}

export default asyncHandler;