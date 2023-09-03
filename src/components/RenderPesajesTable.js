import Table from "./Table";
import {filteredGData} from "./helpers"

const columns = [
    { label: "Codigo", accessor: "Codigo" },
    { label: "Fecha", accessor: "Fecha" },
    { label: "Peso", accessor: "Peso" },
    { label: "Marca", accessor: "Marca" },
    { label: "Operacion", accessor: "Operacion" },
   ];

  let tableData = [{Codigo:'101',Fecha:Date(),Peso:220,Marca:'LEQ',Operacion:'Compra'},
  {Codigo:'102',Fecha:Date(),Peso:230,Marca:'LEQ',Operacion:'Venta'}]  
  tableData = tableData.map((obj,index) => ({ ...obj, id: index }))


//gridColumns: ['Fecha','Codigo','Peso','Marca','Operacion'],
const RenderPesajesTable = (props) => {

  let filteredData = filteredGData(props,tableData)
  return (
    <>
      <Table
        caption="Pesajes"
        data={filteredData}
        columns={columns}
      />
    </>
  );
};

export default RenderPesajesTable;