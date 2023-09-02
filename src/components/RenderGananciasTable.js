import Table from "./Table";

const columns = [
  { label: "Codigo", accessor: "Codigo" },
  { label: "Fecha Inicial", accessor: "FechaInicial" },
  { label: "Fecha Final", accessor: "FechaFinal" },
  { label: "Peso Inicial", accessor: "PesoInicial" },
  { label: "Peso Final", accessor: "PesoFinal" },
  { label: "Ganancia", accessor: "Ganancia" },
 ];

 let tableData = [{Codigo:'101','FechaInicial':Date(),'FechaFinal':Date(),'PesoInicial':220,'PesoFinal':240,'Ganancia':20},
 {Codigo:'102','FechaInicial':Date(),'FechaFinal':Date(),'PesoInicial':230,'PesoFinal':290,'Ganancia':30}];

 tableData = tableData.map((obj,index) => ({ ...obj, id: index }))

//gridColumns: ['Fecha','Codigo','Peso','Marca','Operacion'],
const RenderGananciasTable = () => {
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

export default RenderGananciasTable;