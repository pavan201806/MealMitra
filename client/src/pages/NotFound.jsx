import { Link } from "react-router-dom";
import Navbar from "../components/user/Navbar";

function NotFound() {
  return (
    <>
      <Navbar />
      <div
        className="container d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            Go Back Home
          </Link>
        </div>
      </div>
    </>
  );
}

export default NotFound;
