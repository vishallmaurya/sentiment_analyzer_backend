import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.js";
import { Data } from "../models/data.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { setCookieDomain } from "../utils/setCookieDomain.js";

const registerUser = asyncHandler(async (req, res) => {
    try {
        const { email, password, isGmailLogin } = req.body;
        
        if ((email?.trim() === "") || (password?.trim() === "" && (typeof(isGmailLogin) !== "boolean" || isGmailLogin === false))) {
            throw new ApiError(400, "All fields are mandatory");
        }
    
        let user = await User.findOne({ email });
    
        if (user) {        
            if (password !== undefined && password.trim() !== "") {
                if (user.password === undefined) {
                    user.password = password;
                    await user.save({ validateBeforeSave: false });
                } else {                    
                    const ispwdCorrect = await user.isPasswordCorrect(password);
                    if (!ispwdCorrect) {    
                        throw new ApiError(400, "Wrong password");
                    }
                }
            } else {
                user.isGmailLogin = isGmailLogin;
            }
        } else {
            const isGmail = Boolean(isGmailLogin);
            const obj = isGmail ? { email, isGmailLogin: true } : { email, password };
            user = await User.create(obj);
        }
    
        let accesstoken, refreshToken;
        try {
            accesstoken = await user.generateAccessToken();
            refreshToken = await user.generateRefreshToken();
    
            user.refreshToken = refreshToken;
            user.save({ validateBeforeSave: false });
        } catch (error) {
            throw new ApiError("Error in creating tokens");
        }
    
        const options = {
            httpOnly: true,
            secure: false,
            // secure: process.env.NODE_ENV === "production",
//            sameSite: "None",
            // domain: setCookieDomain(req),
            // path:"/",
        }
        
        return res.status(200)
            .cookie("accessToken", accesstoken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
            new ApiResponse(
                200,
                {   
                    user,
                    refreshToken,
                    accesstoken
                },
                "User logged in!!"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Error occur during login");
    }
})



const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined 
                }
            },
            {
                new: true
            }
        )
    
        const options = {
            httpOnly: true,
            secure: false,
            // secure: process.env.NODE_ENV === "production",
//            sameSite: "None",
            // domain: setCookieDomain(req),
            // path:"/",
        }
    
        return res.status(200).
            clearCookie("accessToken", options).
            clearCookie("refreshToken", options).
            json(new ApiResponse(200, {}, "User logged Out successfully!!"))
    } catch (error) {
        throw new ApiError(400, error?.message || "Error occur during login");
    }
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
      
        if (!user) {
            throw new ApiError(401, "Invalid refresh Token");
        }      

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        let newaccessToken, newrefreshToken
    
        try {
            newaccessToken = await user.generateAccessToken();
            newrefreshToken = await user.generateRefreshToken();
        } catch (error) {
            throw new ApiError("Error in creating tokens");
        }
    
        const options = {
            httpOnly: true,
            secure: false,
            // secure: process.env.NODE_ENV === "production",
//            sameSite: "None",
            // domain: setCookieDomain(req),
            // path:"/",
        }
        
    
        return res.status(200).
            cookie("accessToken", newaccessToken, options).
            cookie("refreshToken", newrefreshToken, options).
            json(new ApiResponse(
                200,
                {
                    accessToken: newaccessToken,
                    refreshToken: newrefreshToken
                },
                "Access Token Refreshed"
            ));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})



const changePassword = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { oldPassword, newPassword } = req.body;
        
        if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }
        
        const isPwdCorrect = user.isPasswordCorrect(oldPassword);

        if (!isPwdCorrect) {
            throw new ApiError(401, "Entered password is incorrect");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        res.status(200).json(
            new ApiResponse(
                200,
                {},
                "Password changed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Error in changing the password");
    }
})


const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return await res.status(200)
    .json(new ApiResponse(
        200,
        {user},
        "User fetched successfully"
    )) 
})


const forgetPassword = asyncHandler(async (req, res) => {
    const {email} = req.body;    

    if (!email?.trim()) {
        throw new ApiError(400, "Email is not provided");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User doesn't exists with this email");
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://sentiment-analysis-rosy-omega.vercel.app/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click on this link to reset your password: \n\n ${resetUrl} \n\n If you did not request this, please ignore this email.`;

    await sendEmail(email, "RESET YOUR PASSWORD", message);

    res.status(200).
        json(new ApiResponse(200, {}, "Password reset email sent successfully"));
})

const resetPassowrd = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    

    if (!password?.trim()) {
        throw new ApiError(400, "New Password is required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); 

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() } ,
    })

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    user.password = password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200,
            {},
            "Password has been reset successfully"
        )
    )
    
})

const getTweetsHistory = asyncHandler(async (req, res) => {
    try {
        const user_id = req.user._id;
        const tweets = await Data.find({user_id}).select("tweet predicted_class createdAt");        

        res.status(200).json(
            new ApiResponse(200,
                tweets,
                "Tweets sent successfully" 
            )
        )
    } catch (error) {
        throw new ApiError(500, "Error occurred during fetching tweets");
    }
})

export { registerUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, forgetPassword, resetPassowrd, getTweetsHistory };
