import "./App.css";
import { Link } from "react-router-dom";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";
import  Codigos  from "./components/Codigos";

function GananciasDiarias() {
  return (
    <>
      <nav>
        <Link className="tabs" to="/pesajes">Pesajes</Link>
        <Link className="tabs" to="/codigos">Codigos</Link>
      </nav>
      <Ganancias/>
    </>
  );
}

export function HisPesajes() {
  return (
    <div > 
      <nav>
        <Link className="tabs" to="/">Ganancias</Link>
        <Link className="tabs" to="/codigos">Codigos</Link>
      </nav>
      <Pesajes/>
    </div>
  );
}

export function HisCodigos() {
  return (
    <>
      <nav>
        <Link className="tabs" to="/">Ganancias</Link>
        <Link className="tabs" to="/pesajes">Pesajes</Link>
      </nav>
      <Codigos/>
    </>
  );
}

export function App() {
  return <GananciasDiarias />;
}
