import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">FEEDILINK</h1>
          <div className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </div>
        </div>
      </nav>

      <main className="hero">
        <div className="container">
          <h2>Connecting Food Donors with Volunteers</h2>
          <p>Reduce food waste by connecting donors with volunteers who can deliver food to those in need.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-secondary">Login</Link>
          </div>
        </div>
      </main>

      <section className="features">
        <div className="container">
          <h3>How It Works</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <h4>Donors</h4>
              <p>Post your surplus food donations and help reduce waste.</p>
            </div>
            <div className="feature-card">
              <h4>Volunteers</h4>
              <p>Pick up and deliver donations to NGOs and those in need.</p>
            </div>
            <div className="feature-card">
              <h4>NGOs</h4>
              <p>Access delivered donations to distribute to your community.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

