import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Data } from "../models/data.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";

// const predictTweetSentiment = asyncHandler(async (req, res) => {
//     try {
//         const { tweet } = req.body;

//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
//         let user_id;

//         if (token) {
//             const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//             const user = await User.findById(decodedToken?._id).select("-refreshToken");

//             if (user) {
//                 user_id = user;
//             }
//         }
        
//         if (tweet?.trim() === "") {
//             throw new ApiError(400, "Fields are mandatory");
//         }
        
//         const url = process.env.SENTIMENT_API_URL + "/" + process.env.SENTIMENT_ENDPOINT;
//         const response = await axios.post(url, { tweet }, { withCredentials: true });
        
//         const updated_data = { ...response.data, user_id };
//         await Data.create(updated_data);

//         return res.status(200).json(new ApiResponse(200, response.data, "Get the data successfully"));

//     } catch (error) {
//         console.error("Error from ML API:", error.response?.data || error.message);
//         throw new ApiError(400, `ML Model Error: ${error.response?.data?.message || error.message}`);
//     }
// });

const predictTweetSentiment = asyncHandler(async (req, res) => {
    try {
        const { tweet } = req.body;
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        let user_id;

        if (token) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-refreshToken");
            if (user) user_id = user;
        }
        
        if (tweet?.trim() === "") {
            throw new ApiError(400, "Fields are mandatory");
        }
        
        // Start async task
        const initResponse = await axios.post(
            process.env.SENTIMENT_API_URL + "/predict",
            { tweet },
            { withCredentials: true, timeout: 10000 }
        );
        
        const taskId = initResponse.data.task_id;
        let result;
        let attempts = 0;
        const maxAttempts = 12; // 1 minute total (5s intervals)
        
        // Poll for results
        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse = await axios.get(
                `${process.env.SENTIMENT_API_URL}/task-status/${taskId}`,
                { withCredentials: true }
            );
            
            if (statusResponse.data.ready) {
                result = statusResponse.data.result;
                break;
            }
        }
        
        if (!result) throw new ApiError(408, "Analysis timed out");
        
        const updated_data = { ...result, user_id };
        await Data.create(updated_data);
        
        return res.status(200).json(new ApiResponse(200, result, "Analysis completed"));

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        throw new ApiError(error.statusCode || 500, error.message);
    }
});

export { predictTweetSentiment };