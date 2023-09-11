import "./App.css";
//import "./assets/base.css";
import { Link } from "react-router-dom";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Codigos  from "./components/Codigos";

function GananciasDiarias() {
  return (
    <div>
      <nav>
        <Link to="/">Ganancias</Link>
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
      </nav>
      <Codigos/>
    </div>
  );
}

export function App() {
  return <GananciasDiarias />;
}
