import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Menubar from "../components/admin/Menubar";

function AdminLayout() {
  return (
    <div className="d-flex" id="wrapper" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <div
        id="page-content-wrapper"
        className="w-100"
        style={{
          background: "#fafafa",
        }}
      >
        <Menubar />
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
