import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannel,
  getUserChannelSubscriber,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/channel/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscriber);

router.route("/user/:subscriberId").get(getSubscribedChannel);

export default router;
