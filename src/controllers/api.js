import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.js";


const predictTweetSentiment = asyncHandler(async (req, res) => {
    try {
        const { tweet } = req.body;
        
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
        
        return res.status(200).
            json(new ApiResponse(200, data, "Get the data successfully"));
    } catch (error) {
        throw new ApiError(400, error?.message || "Error occur during getting output");
    }
})

export { predictTweetSentiment };