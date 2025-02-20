import mongoose, { Schema } from "mongoose";

const dataSchema = new Schema({
    sentence: {
        type: String, 
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    class: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

export const Data = mongoose.model("Data", dataSchema);
