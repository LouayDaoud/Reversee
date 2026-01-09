const express = require('express');
const {
  createARSession,
  getMyARSessions,
  getARSession,
  updateARSession,
  addCapture,
  toggleShare,
  generateQRCode
} = require('../controllers/arController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// User routes - require authentication
router.use(protect);

router.route('/sessions')
  .post(createARSession)
  .get(getMyARSessions);

router.route('/sessions/:id')
  .get(getARSession)
  .put(updateARSession);

router.post('/sessions/:id/captures', addCapture);
router.put('/sessions/:id/share', toggleShare);
router.post('/qr-code', generateQRCode);

module.exports = router;

