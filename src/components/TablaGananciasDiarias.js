import Table from "./Table";
const columns = [
  { label: "Codigo", accessor: "Codigo",width:"15%" },
  { label: "Fecha Inicial", accessor: "FechaInicial",width:"20%" },
  { label: "Fecha Final", accessor: "FechaFinal",width:"20%" },
  { label: "Peso Inicial", accessor: "PesoInicial",width:"15%" },
  { label: "Peso Final", accessor: "PesoFinal",width:"15%" },
  { label: "Ganancia", accessor: "Ganancia",width:"15%" },
 ];

const TablaGananciasDiarias = (props) => {
  
  let tableData = props.gridData.map((obj,index) => ({ ...obj, id: index }))
  console.log(`TablaGananciasDiarias props.gridDataLegth=${tableData.length}`)
  return (
    <>
      <Table
        caption={tableData.length}
        data={tableData}
        columns={columns}
      />
    </>
  );
};

export default TablaGananciasDiarias;