import { useState,useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { useSortableTable } from "./useSortableTable";

const Table = ({ caption, data, columns }) => {
// ToDo; Fix sorting
const [tableData, setTableData] = useState([]);
const [sortOrder,setSortOrder] = useState({accessor:columns[0].accessor,sortOrder:'down'})
useEffect(() => { setTableData(data) }, [data]);
useEffect(() => { 
  let sortKey = sortOrder.accessor;
  let data  = tableData.slice().sort((a, b) => {
      a = a[sortKey]
      b = b[sortKey]
      return (a === b ? 0 : a > b ? 1 : -1) 
    });

  setTableData(data);
}, [sortOrder]);

return (
    <>
      <table className="table">
        <TableHead {...{ columns, setSortOrder, sortOrder}} />
        <TableBody {...{ tableData, columns  }} />
      </table>
    </>
  );
};

export default Table;

