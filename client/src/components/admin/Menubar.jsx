import { Link, useNavigate } from "react-router-dom";

function Menubar() {
    const navigate=useNavigate()
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light border-bottom custom-navbar">
        <div className="container-fluid">
          <button
            id="sidebarToggle"
            onClick={() => {
              document.body.classList.toggle("sb-sidenav-toggled");
            }}
            style={{
              background: "transparent", // remove default button background
              border: "none", // remove default button border
              padding: "0", // remove default padding
              cursor: "pointer", // show pointer on hover
              height: "60px",
              width: "60px",
              fontSize: "36px", // bigger symbol size
              lineHeight: "60px", // vertically center the symbol
              textAlign: "center", // horizontally center the symbol
              userSelect: "none", // prevent text selection
            }}
          >
            ☰
          </button>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mt-2 mt-lg-0 align-items-center">
              <li className="nav-item active">
                <Link className="nav-link" to="/admin/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item active">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              

              <li className="nav-item ms-3">
                <button
                  className="btn btn-outline-danger"
                  onClick={() => {
                    navigate("/")
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Menubar;

