import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Data } from "../models/data.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";

const predictTweetSentiment = asyncHandler(async (req, res) => {
    try {
        const { tweet } = req.body;
        console.log("Incoming request body:", req.body);

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        let user_id;

        if (token) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-refreshToken");

            if (user) {
                user_id = user;
            }
        }
        
        if (tweet?.trim() === "") {
            throw new ApiError(400, "Fields are mandatory");
        }

        const url = process.env.SENTIMENT_API_URL + "/" + process.env.SENTIMENT_ENDPOINT;
        console.log("Calling ML API:", url);

        // ✅ Using Axios
        const response = await axios.post(url, { tweet }, {withCredentials: true});

        console.log("ML API Response:", response.data);

        const updated_data = { ...response.data, user_id };
        await Data.create(updated_data);

        return res.status(200).json(new ApiResponse(200, response.data, "Get the data successfully"));

    } catch (error) {
        console.error("Error from ML API:", error.response?.data || error.message);
        throw new ApiError(400, `ML Model Error: ${error.response?.data?.message || error.message}`);
    }
});

export { predictTweetSentiment };