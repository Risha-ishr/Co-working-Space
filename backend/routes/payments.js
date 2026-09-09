const express = require('express');
const axios = require('axios');
const Booking = require('../models/Booking');
const { getAccessToken, getInvoicePaymentStatus } = require('../utils/freshbooks');

const router = express.Router();

// FreshBooks sends webhooks as URL-encoded form data
router.post('/webhook', express.urlencoded({ extended: true }), async (req, res) => {
  // Acknowledge immediately — FreshBooks expects a quick 200
  res.status(200).send('OK');

  const { name: eventName, object_id, account_id } = req.body;

  if (eventName !== 'payment.create') return;

  try {
    const token = await getAccessToken();
    const paymentRes = await axios.get(
      `https://api.freshbooks.com/accounting/account/${account_id}/payments/payments/${object_id}`,
      { headers: { Authorization: `Bearer ${token}`, 'Api-Version': 'alpha' } }
    );

    const payment = paymentRes.data?.response?.result?.payment;
    if (!payment) return;

    const invoiceId = String(payment.invoiceid);

    await Booking.findOneAndUpdate(
      { freshbooksInvoiceId: invoiceId },
      { paymentStatus: 'paid' }
    );
  } catch (err) {
    console.error('FreshBooks webhook error:', err.message);
  }
});

// GET /api/payments/status/:bookingId — the frontend polls this after opening
// the FreshBooks payment page. The webhook normally flips paymentStatus to 'paid';
// when it hasn't (missed webhook, or local dev where FreshBooks can't reach us)
// we ask FreshBooks directly about the invoice and persist the result.
router.get('/status/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .select('paymentStatus paymentLink freshbooksInvoiceId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.paymentStatus === 'pending' && booking.freshbooksInvoiceId) {
      try {
        const fbStatus = await getInvoicePaymentStatus(booking.freshbooksInvoiceId);
        if (fbStatus === 'paid') {
          booking.paymentStatus = 'paid';
          await booking.save();
        }
      } catch (err) {
        console.error('FreshBooks status check failed:', err.message);
      }
    }

    res.json({
      paymentStatus: booking.paymentStatus,
      paymentLink: booking.paymentLink,
      freshbooksInvoiceId: booking.freshbooksInvoiceId,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

module.exports = router;
