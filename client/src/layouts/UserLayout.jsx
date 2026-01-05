import { Outlet } from "react-router-dom";
import Navbar from "../components/user/Navbar";

function UserLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default UserLayout;
