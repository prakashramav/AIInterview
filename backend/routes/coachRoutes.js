const { 
  startCoachSession, 
  processUserMessage, 
  getCoachSession, 
  getUserSessions 
} = require('../controllers/coachController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/start', auth, startCoachSession);
router.post('/message', auth, processUserMessage);
router.get('/sessions', auth, getUserSessions);
router.get('/:id', auth, getCoachSession);

module.exports = router;
