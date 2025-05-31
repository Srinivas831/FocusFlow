const express = require('express');

const { startSession, abortSession, endSession, addInterruption, getActiveSession, getAnalytics } = require('../controllers/session.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const sessionRouter = express.Router();
sessionRouter.use(authMiddleware);

sessionRouter.post('/start', startSession);
sessionRouter.post('/end', endSession);
sessionRouter.post('/abort', abortSession);
sessionRouter.patch('/interrupt/:id', addInterruption);
sessionRouter.get('/active', getActiveSession);
sessionRouter.get('/analytics', getAnalytics);


module.exports = { sessionRouter };
