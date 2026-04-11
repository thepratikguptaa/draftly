import NextAuth from "next-auth";
import { connectDB } from "./mongodb";
import { User } from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
      } catch (error) {
        console.error("DB error during signIn, allowing login anyway:", error);
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.dbId = dbUser._id.toString();
            token.isPremium = dbUser.isPremium;
          }
        } catch (error) {
          console.error("DB error during jwt:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.dbId) {
        session.user.id = token.dbId as string;
        (session.user as any).isPremium = token.isPremium as boolean;
      }
      return session;
    },
  },
});
