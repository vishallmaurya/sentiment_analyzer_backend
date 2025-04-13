import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "../../db/index.js";
import { Data } from "../data.js";

const addFieldToTweets = async () => {
    try {
        connectDB();

        const result = await Data.updateMany(
            { used_in_training: { $exists: false } },
            { $set: { used_in_training: true } }
        );

        console.log(`${result.modifiedCount} documents updated.`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating documents:", error);
        process.exit(1);
    }
};

await addFieldToTweets();
