import { Link } from "react-router-dom"

function Sidebar(){
    return(
        <>
            <div className="sidebar" id="sidebar-wrapper">
                <div 
                className="sidebar-heading border-bottom" 
                style={{ height: "76px", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", paddingLeft: "1rem" }}
                >
                <img 
                src="/assets/munchly.png" 
                alt="Munchly Logo" 
                style={{ height: "60px", width: "auto" }} 
                />
                </div>

                <div className="list-group list-group-flush">
                <Link className="list-group-item p-3" to="/addfood">Add Food</Link>
                <Link className="list-group-item p-3" to="/listfood">List Food</Link>
                <Link className="list-group-item p-3" to="/adminorder">Orders</Link>
                </div>
            </div>
        </>
    )
}
export default Sidebar

