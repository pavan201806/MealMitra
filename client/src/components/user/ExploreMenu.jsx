import { useRef } from "react";
import { categories } from "../../assets/assets";

function ExploreMenu() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="explore-menu position-relative">
      <h1 className="d-flex align-items-center justify-content-between">
        Explore our menu
        <div className="d-flex">
          <i
            className="bi bi-arrow-left-circle scroll-icon"
            onClick={scrollLeft}
            style={{ cursor: "pointer", fontSize: "2rem", marginRight: "10px" }}
          ></i>
          <i
            className="bi bi-arrow-right-circle scroll-icon"
            onClick={scrollRight}
            style={{ cursor: "pointer", fontSize: "2rem" }}
          ></i>
        </div>
      </h1>
      <p>Explore curated lists of dishes from top categories</p>
      <div
        ref={scrollRef}
        className="d-flex gap-4 overflow-auto explore-menu-list py-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {categories.map((item) => (
          <div key={item.category} className="text-center flex-shrink-0">
            <img
              src={item.icon}
              alt={item.category}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%", // ✅ makes it round
                display: "block",
              }}
            />
            <p className="mt-2">{item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreMenu;

