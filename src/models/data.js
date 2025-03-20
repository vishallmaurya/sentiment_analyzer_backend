import mongoose, { Schema } from "mongoose";

const dataSchema = new Schema({
    tweet: {
        type: String, 
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    predicted_class: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export const Data = mongoose.model("Data", dataSchema);
