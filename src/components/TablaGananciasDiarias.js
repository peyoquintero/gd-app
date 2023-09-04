import Table from "./Table";
import {filteredGData} from "./helpers"
const columns = [
  { label: "Codigo", accessor: "Codigo",width:"15%" },
  { label: "Fecha Inicial", accessor: "FechaInicial",width:"20%" },
  { label: "Fecha Final", accessor: "FechaFinal",width:"20%" },
  { label: "Peso Inicial", accessor: "PesoInicial",width:"15%" },
  { label: "Peso Final", accessor: "PesoFinal",width:"15%" },
  { label: "Ganancia", accessor: "Ganancia",width:"15%" },
 ];

 let tableData = [{Codigo:'101','FechaInicial':Date(),'FechaFinal':Date(),'PesoInicial':220,'PesoFinal':240,'Ganancia':20},
 {Codigo:'102','FechaInicial':Date(),'FechaFinal':Date(),'PesoInicial':230,'PesoFinal':290,'Ganancia':30}];

 tableData = tableData.map((obj,index) => ({ ...obj, id: index }))

//gridColumns: ['Fecha','Codigo','Peso','Marca','Operacion'],
const TablaGananciasDiarias = (props) => {
  tableData = filteredGData(tableData,props.filterKey,props.excludeFilter);
  return (
    <>
      <Table
        caption="Ganancias"
        data={tableData}
        columns={columns}
      />
    </>
  );
};

export default TablaGananciasDiarias;