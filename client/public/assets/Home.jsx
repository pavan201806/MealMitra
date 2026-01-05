import { Link } from "react-router-dom";
import Explore from "../../Explore";
import Menubar from "./Menubar";
import Sidebar from "./Sidebar";

function Home() {
    const categories = [
    {
      name: "Biryani",
      img: "/assets/biryani.png",
    },
    {
      name: "Pizzas",
      img: "/assets/pizza.png",
    },
    {
      name: "Desserts",
      img: "/assets/dessert.png",
    },
    {
      name: "Tiffins",
      img: "/assets/tiffins.png",
    },
    {
      name: "Burgers",
      img: "/assets/burger.png",
    },
    {
      name: "Ice Cream",
      img: "/assets/icecream.png",
    },
  ];


  const actions = [
    {
      label: "Add Food Item",
      path: "/addfood",
      img: "https://source.unsplash.com/100x100/?add,food",
    },
    {
      label: "List Food Items",
      path: "/listfood",
      img: "https://source.unsplash.com/100x100/?menu,food",
    },
    {
      label: "View Orders",
      path: "/adminorder",
      img: "https://source.unsplash.com/100x100/?order,delivery",
    },
  ];

  return (
    <div className="d-flex" id="wrapper" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      <div
        id="page-content-wrapper"
        className="w-100"
        style={{
          background: "#fafafa",
        }}
      >
        <Menubar />

        <div className="container py-5">
          {/* Hero */}
          <div
            className="p-5 rounded-4 mb-5"
            style={{
              background: "linear-gradient(120deg, #ff914d, #ff6e7f)",
              color: "#fff",
            }}
          >
            <h1 className="fw-bold mb-2">🍽️ Welcome Back, Admin!</h1>
            <p className="mb-0 fs-5">
              Manage food, track orders & keep customers happy!
            </p>
          </div>

          {/* Categories */}
          <div className="mb-5">
            <h3 className="mb-4 fw-bold">Popular Categories</h3>
            <div className="row g-4">
              {categories.map((cat) => (
                <div key={cat.name} className="col-6 col-md-4 col-lg-3">
                  <div
                    className="bg-white rounded-4 shadow-sm text-center p-3"
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="rounded-3 mb-2"
                      style={{ width: "100%", height: "150px", objectFit: "cover" }}
                    />
                    <h6 className="fw-semibold">{cat.name}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-5">
            <h3 className="mb-4 fw-bold">Quick Actions</h3>
            <div className="row g-4">
              {actions.map((action) => (
                <div key={action.label} className="col-md-4">
                  <Link
                    to={action.path}
                    className="text-decoration-none text-dark"
                  >
                    <div className="bg-white rounded-4 shadow-sm text-center p-4">
                      <img
                        src={action.img}
                        alt={action.label}
                        style={{ width: "60px", height: "60px" }}
                        className="mb-2"
                      />
                      <h6 className="fw-semibold">{action.label}</h6>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="mb-5">
            <h3 className="fw-bold mb-3">More Features</h3>
            <div className="bg-white p-4 rounded-4 shadow-sm">
              <Explore />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
