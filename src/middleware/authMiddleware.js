export function checkApiKey(req, res, next) {
    // Accept API key from header only
    const apiKey = req.header('x-api-key');
    const validKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
    }

    next(); // move to next middleware or route
}
