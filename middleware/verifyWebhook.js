function verifyWebhook(req, res, next) {
  try {
    const providedSecret = req.get('x-webhook-secret');

    if (!providedSecret || providedSecret !== process.env.WEBHOOK_SECRET) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
}

module.exports = { verifyWebhook };
