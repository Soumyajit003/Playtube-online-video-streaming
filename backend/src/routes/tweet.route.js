import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, updateTweet, getUserTweet, deleteTweet } from "../controllers/tweet.controller.js"

const router = Router();
router.use(verifyJWT);

router.route("/get/:userId").get(getUserTweet);
router.route("/create").post(createTweet);
router.route("/update/:tweetId").patch(updateTweet);
router.route("/delete/:tweetId").delete(deleteTweet);


export default router;