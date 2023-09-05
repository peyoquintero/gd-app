import { useState,useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { useSortableTable } from "./useSortableTable";

const Table = ({ caption, data, columns }) => {
// ToDo; Fix sorting
//const [tableData, setTableData] = useState([]);
//useEffect(() => { setTableData(data) }, [])
console.log(`Table data length=${data.length}`)
return (
    <>
      <table className="table">
        <caption>{caption}</caption>
        <TableHead {...{ columns }} />
        <TableBody {...{ data, columns }} />
      </table>
    </>
  );
};

export default Table;

