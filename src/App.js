import "./App.css";
import { Link } from "react-router-dom";
import  Ganancias  from "./components/Ganancias";
import  Pesajes  from "./components/Pesajes";

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

export function Codigos() {
  return (
    <>
      <nav>
        <Link className="tabs" to="/">Ganancias</Link>
        <Link className="tabs" to="/pesajes">Pesajes</Link>
      </nav>
      <div className="tab-content">
              <h1>codigos Us</h1>
    </div>
    </>
  );
}

export function App() {
  return <GananciasDiarias />;
}
