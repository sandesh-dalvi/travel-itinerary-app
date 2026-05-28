import LoginForm from "@/components/auth/LoginForm";
import { Plane } from "lucide-react";

const Login = () => {
  return (
    <div className=" min-h-screen flex">
      <div className=" hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Plane className="h-6 w-6" />
          <span>TripCrafter</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Your bookings.
            <br />
            Your itinerary.
            <br />
            Automatically.
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Upload flight tickets, hotel bookings, and travel documents. Let AI
            craft the perfect day-by-day itinerary for you.
          </p>
        </div>
        <p className="text-primary-foreground/60 text-sm">
          © {new Date().getFullYear()} TripCrafter. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className=" flex-1 flex items-center justify-center p-6 bg-background">
        <div className=" w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Plane className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">TripCrafter</span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
