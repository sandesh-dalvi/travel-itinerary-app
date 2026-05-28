import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const AppLayout = () => {
  return (
    <div className=" min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className=" flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
