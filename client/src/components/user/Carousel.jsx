function Carousel() {
  return (
    <div
      id="carouselExampleCaptions"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="3000"  // 👈 Add this for custom speed, or remove for default 5s
    >
      <div className="carousel-indicators">
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="0"
          className="active"
          aria-current="true"
          aria-label="Slide 1"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="1"
          aria-label="Slide 2"
        ></button>
        <button
          type="button"
          data-bs-target="#carouselExampleCaptions"
          data-bs-slide-to="2"
          aria-label="Slide 3"
        ></button>
      </div>

      <div className="carousel-inner">
        <div className="carousel-item active">
          <img
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            className="d-block w-100"
            style={{ height: '400px', objectFit: 'cover' }}
            alt="First slide"
          />
          <div className="carousel-caption d-none d-md-block">
            <h2>Explore More</h2>
            <p>Discover new tastes and exciting dishes every day.</p>
          </div>
        </div>

        <div className="carousel-item">
          <img
            src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            className="d-block w-100"
            style={{ height: '400px', objectFit: 'cover' }}
            alt="Second slide"
          />
          <div className="carousel-caption d-none d-md-block">
            <h2>Chef's Specials</h2>
            <p>Handcrafted meals made with fresh ingredients.</p>
          </div>
        </div>

        <div className="carousel-item">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            className="d-block w-100"
            style={{ height: '400px', objectFit: 'cover' }}
            alt="Third slide"
          />
          <div className="carousel-caption d-none d-md-block">
            <h2>Taste the Best</h2>
            <p>Order now and enjoy delicious food at your doorstep.</p>
          </div>
        </div>
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default Carousel;

