import { useState,useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { useSortableTable } from "./useSortableTable";

const Table = ({ caption, data, columns }) => {
// ToDo; Fix sorting
const [tableData, setTableData] = useState([]);
useEffect(() => { setTableData(data) }, [data]);
return (
    <>
      <table className="table">
        <TableHead {...{ columns }} />
        <TableBody {...{ tableData, columns }} />
      </table>
    </>
  );
};

export default Table;

