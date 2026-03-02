import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Determine the admin password (fallback for dev if env var isn't set)
                const adminPassword = process.env.ADMIN_PASSWORD || 'veedu2025';

                if (credentials?.password === adminPassword) {
                    // Password matches, return a successful admin user object
                    return { id: "1", name: "Veedu Admin", email: "admin@veedu.store" };
                }

                return null;
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }: any) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
    },
    trustHost: true, // Necessary if deploying without a NEXTAUTH_URL
});
