import mongoose, { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema({
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title:{
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
    },
},{timestamps: true});

export const Tweet = new model("Tweet", tweetSchema);