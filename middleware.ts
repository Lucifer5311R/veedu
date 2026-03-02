import { auth } from "@/auth";

export default auth;

export const config = {
    // Inject auth to all routes except api, _next/static, _next/image, favicon.ico
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
