import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
  fontSize: "12px",
  textDecoration: "none",
  color: isActive ? "#1a1a1a" : "#999",
});

export default function BottomNav() {
  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
        borderTop: "1px solid #e5e5e5",
        background: "#fff",
      }}
    >
      <NavLink to="/" style={linkStyle} end>
        <span>Home</span>
      </NavLink>
      <NavLink to="/saved" style={linkStyle}>
        <span>Saved</span>
      </NavLink>
      <NavLink to="/about" style={linkStyle}>
        <span>About</span>
      </NavLink>
    </nav>
  );
}
