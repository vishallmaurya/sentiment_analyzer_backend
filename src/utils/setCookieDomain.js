import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const setCookieDomain = (req) => {
    const host = req.headers.origin || req.headers.host;

    if (host.includes("localhost")) {
        return "localhost";
    } else if (host.includes(process.env.FRONTEND_COOKIE_DOMAIN)) {
        return process.env.FRONTEND_COOKIE_DOMAIN;
    } else if (host.includes(process.env.AWS_COOKIE_DOMAIN)) {
        return process.env.AWS_COOKIE_DOMAIN;
    }
    return undefined; 
};

export { setCookieDomain };