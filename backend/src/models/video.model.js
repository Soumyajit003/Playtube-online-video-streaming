import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videofile: {
            type: String,
            required: [true, "Must add a video"]
        },
        thumbnail: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        videoPublicId:{
            type:String
        },
        thumbnailPublicId:{
            type:String
        },
        duration: {
            type: Number,
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }

    }, { timestamps: true });


videoSchema.plugin(mongooseAggregatePaginate);       // if we want to use mongooseAggregatePaginate into any schema then we have to inject using .plugin hook
export const Video = mongoose.model('Video', videoSchema);