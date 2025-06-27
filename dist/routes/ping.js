import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => {
    // TODO: Count Website Visitors
    console.log('PING REQUESTED');
    res.json({ text: 'pong' });
});
export { router as pingRouter };
//# sourceMappingURL=ping.js.map