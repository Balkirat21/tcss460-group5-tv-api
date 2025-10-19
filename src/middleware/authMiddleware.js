export function checkApiKey(req, res, next) {
    // Accept API key from either header OR query parameter
    const apiKey = req.header('x-api-key') || req.query.apikey;
    const validKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
    }

    next(); // move to next middleware or route
}
