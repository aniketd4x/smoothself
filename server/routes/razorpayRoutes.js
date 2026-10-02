const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * POST /api/razorpay/create-order
 * Creates a Razorpay order and returns the order_id to the client.
 * The client uses this to open the Razorpay checkout popup.
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // Razorpay expects paise (1 INR = 100 paise)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1 // Auto-capture
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,        // rzp_order_id sent to client
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create Razorpay order' });
  }
});

/**
 * POST /api/razorpay/verify
 * Verifies the Razorpay payment signature after successful payment.
 * Returns { success: true } if signature matches — payment is genuine.
 */
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({
        success: true,
        paymentId: razorpay_payment_id,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment signature verification failed. Possible fraud.' });
    }
  } catch (err) {
    console.error('[Razorpay Verify Error]', err);
    res.status(500).json({ success: false, message: err.message || 'Payment verification error' });
  }
});

module.exports = router;
