import "./App.css";
import Table from "./components/Table";
import { Link } from "react-router-dom";
import RenderPesajesTable from "./components/RenderPesajesTable";
import RenderGananciasTable from "./components/RenderGananciasTable";


 /*
function Home() {
  return (
    <div>
      <nav>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <DemoGrid  filterKey=""
  data={[{Codigo:'101','FechaInicial':Date(),'FechaFinal':Date(),'PesoInicial':220,'PesoFinal':240,'Ganancia':20}]} 
  columns={['Codigo','FechaInicial','FechaFinal','PesoInicial','PesoFinal','Ganancia']} 
  headers= {['Codigo','Inicio','Final','Peso(I)','Peso(F)','Ganancia']}
  headerwidthpct={[18,23,23,18,18]}
  excludeChar= ""
  excludeFilter=""
  sortKey="">
      </DemoGrid>
      </div>
  );
}
*/

export function About() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <h1>About Us</h1>
    </div>
  );
}

export function Contact() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <h1>Contact Us</h1>
    </div>
  );
}

export function App() {
  return (
    <div className="table_container">
      <h1>Reusable sortable table with React</h1>
      <RenderGananciasTable filterKey="220" excludeFilter=""/>
      <br />
    </div>
  );
};

