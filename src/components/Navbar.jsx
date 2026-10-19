import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand" aria-label="JikAI Beranda">
        <span>
          Jik<span className="brand-accent">AI</span>
        </span>
      </Link>

      <nav className="nav-links" aria-label="Navigasi utama">
        <NavLink to="/" end>
          Beranda
        </NavLink>

        <NavLink to="/simulasi">Ruang Simulasi</NavLink>

        <NavLink to="/arsip">Arsip</NavLink>
      </nav>

      <NavLink to="/simulasi" className="nav-button">
        Mulai Menjelajah <span aria-hidden="true">↗</span>
      </NavLink>
    </header>
  );
}
