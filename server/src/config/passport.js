import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import config from "./config.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails
          ?.find((item) => item.verified === true)
          ?.value?.trim()
          .toLowerCase();

        if (!profile.id || !email) {
          return done(null, false, {
            message: "Google did not provide a verified email.",
          });
        }

        let user = await User.findOne({ googleId: profile.id });

        if (user) return done(null, user);

        const existingUser = await User.findOne({ email });

        if (config.NODE_ENV === "development") {
          console.log("Google account check:", {
            selectedEmail: email,
            databaseEmail: existingUser?.email,
            accountFound: Boolean(existingUser),
            googleIdInSchema: Boolean(User.schema.path("googleId")),
            googleIdSaved: Boolean(existingUser?.googleId),
            sameGoogleId: existingUser?.googleId === profile.id,
          });
        }

        if (existingUser) {
          return done(null, false, {
            code: existingUser.googleId
              ? "GOOGLE_LOGIN_FAILED"
              : "PASSWORD_LOGIN_REQUIRED",
            message:
              "This email already has an account. Use its original sign-in method.",
          });
        }

        const name = profile.displayName?.trim() || "Google User";

        user = await User.create({
          googleId: profile.id,
          name: name.length >= 2 ? name.slice(0, 60) : "Google User",
          email,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
