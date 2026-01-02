import { authClient } from "@/lib/auth-client";
import { Button } from "react-native";

export default function SocialSignIn() {
    
    const handleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard"
        })
    };
    return <Button title="Login with Google" onPress={handleLogin} />;
}