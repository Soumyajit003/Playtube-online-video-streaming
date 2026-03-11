import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoAllComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/add/:videoId").post(addComment);
router.route("/update/:commentId").patch(updateComment);
router.route("/delete/:commentId").delete(deleteComment);
router.route("/allcomments/:videoId").get(getVideoAllComments);

export default router;
