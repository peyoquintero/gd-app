import { useState,useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { useSortableTable } from "./useSortableTable";

const Table = ({ caption, data, columns }) => {
// ToDo; Fix sorting
const [tableData, setTableData] = useState([]);
useEffect(() => { setTableData(data) }, [])
return (
    <>
      <table className="table">
        <caption>{`data length=${data.length}, tbLength:${tableData.length}`}</caption>
        <TableHead {...{ columns }} />
        <TableBody {...{ tableData, columns }} />
      </table>
    </>
  );
};

export default Table;

