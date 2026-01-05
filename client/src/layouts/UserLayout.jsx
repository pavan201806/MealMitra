import { Outlet } from "react-router-dom";
import Navbar from "../components/user/Navbar";
import VoiceAgent from "../components/common/VoiceAgent";

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />

      {/* LiveKit Voice Assistant */}
      <VoiceAgent />
    </>
  );
};

export default UserLayout;
