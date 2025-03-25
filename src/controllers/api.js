import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Data } from "../models/data.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";


const predictTweetSentiment = asyncHandler(async (req, res) => {
    try {
        const { tweet } = req.body;
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        let user_id;

        if (token) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-refreshToken");

            if (user) {
                user_id = user;
            }
        }
        
        if(tweet?.trim() === "") {
            throw new ApiError(400, "Fields are mandatory");
        }

        const url = process.env.SENTIMENT_API_URL + "/" + process.env.SENTIMENT_ENDPOINT;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ tweet }),
        });

        const data = await response.json();
        const updated_data = { ...data, user_id };
        await Data.create(updated_data);
        
        return res.status(200).
            json(new ApiResponse(200, data, "Get the data successfully"));
    } catch (error) {
        throw new ApiError(400, "Error occur during getting output");
    }
})

export { predictTweetSentiment };