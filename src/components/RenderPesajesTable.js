import Table from "./Table";
import {filteredGData} from "./helpers"

const columns = [
    { label: "Codigo", accessor: "Codigo",width:"20%" },
    { label: "Fecha", accessor: "Fecha",width:"25%" },
    { label: "Peso", accessor: "Peso",width:"15%" },
    { label: "Marca", accessor: "Marca",width:"15%" },
    { label: "Operacion", accessor: "Operacion",width:"20%" },
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