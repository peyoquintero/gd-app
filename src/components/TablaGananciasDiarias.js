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
  console.log(`TablaGananciasDiarias props.gridDataLegth=${props.gridData.length}`)
  return (
    <>
      <Table
        caption={props.gridData.length}
        data={props.gridData}
        columns={columns}
      />
    </>
  );
};

export default TablaGananciasDiarias;