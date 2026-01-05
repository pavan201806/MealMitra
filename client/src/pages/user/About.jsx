import React from "react";

function About() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">About Munchly</h1>
      <p className="lead text-center mb-5">
        Welcome to <strong>Munchly</strong> — your friendly neighborhood restaurant located in the heart of <strong>Rajam</strong>!
      </p>

      <div className="row">
        <div className="col-md-6 mb-4">
          <img
            src="https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80"
            alt="Our Restaurant"
            className="img-fluid rounded-4 shadow"
          />
        </div>
        <div className="col-md-6">
          <h4>Our Story</h4>
          <p>
            At Munchly, we believe that food brings people together. Since opening our doors in Rajam,
            our mission has been to serve delicious, freshly prepared dishes made with love and the best local ingredients.
          </p>
          <h4>What We Serve</h4>
          <p>
            From flavorful biryanis and hearty meals to quick bites and sweet treats, our menu is crafted
            to satisfy every craving. Whether you're dining in with family, grabbing a quick lunch with friends,
            or ordering food to enjoy at home — we've got you covered!
          </p>
          <h4>Why Choose Us</h4>
          <ul>
            <li>✔️ Fresh, high-quality ingredients</li>
            <li>✔️ Cozy and family-friendly ambiance</li>
            <li>✔️ Hygienic cooking and quick service</li>
            <li>✔️ Friendly staff who care</li>
          </ul>
          <p>
            We are proud to be a part of Rajam's growing food scene and look forward to serving you soon!
          </p>
        </div>
      </div>

      <div className="text-center mt-5">
        <h5>Visit Us</h5>
        <p>Munchly Restaurant, Main Road, Rajam, Andhra Pradesh</p>
        <p>📞 Call us at +91-9876543210</p>
        <p>⏰ Open daily: 11:00 AM – 10:00 PM</p>
      </div>
    </div>
  );
}

export default About;

