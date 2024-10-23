import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import UserService from "@/service/UserService";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { set } from "date-fns";
import { setCookie } from "typescript-cookie";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  let decodedToken = null;
  let now = new Date();

  useEffect(() => {
    if (token && token !== "" && token !== "undefined") {
      decodedToken = jwtDecode(token ?? "");
      if (decodedToken && now.getTime() / 1000 - (decodedToken?.exp || 0) < 0) {
        nav("/");
      }
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);
  const handleLogin = async () => {
    localStorage.removeItem("token");
    setCookie("user", "", { expires: -1 });
    UserService.login({ email: email, password: password }).then(() => {
      console.log("Login successfully");
      nav("/");
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-1/2 mr-2" onClick={handleLogin}>
            Log in
          </Button>
          <Button className="w-1/2 ml-2" onClick={() => nav("/register")}>
            Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
