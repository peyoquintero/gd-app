import "./App.css";

import { Link } from "react-router-dom";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Codigos  from "./components/Codigos";

function GananciasDiarias() {
  return (
    <div>
      <nav>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Ganancias</Link>
        <Link to="/pesajes">Pesajes</Link>
        <Link to="/codigos">Codigos</Link>
      </nav>
      <Ganancias/>
    </div>
  );
}

export function HisPesajes() {
  return (
    <div > 
      <nav>
        <Link to="/">Ganancias</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Pesajes</Link>
        <Link to="/codigos">Codigos</Link>
      </nav>
      <Pesajes/>
    </div>
  );
}

export function HisCodigos() {
  return (
    <div>
      <nav>
        <Link to="/">Ganancias</Link>
        <Link to="/pesajes">Pesajes</Link>
        <Link style={{color:'rgb(0, 106, 255)'}} to="/">Codigos</Link>
      </nav>
      <Codigos/>
    </div>
  );
}

export function App() {
  return <GananciasDiarias />;
}
