import { useState,useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";

const Table = ({ data, columns }) => {
const [tableData, setTableData] = useState([]);
const [sortOrder,setSortOrder] = useState({accessor:columns[0].accessor,sortOrder:'down'})
useEffect(() => { setTableData(data) }, [data]);
useEffect(() => { 
  let sortKey = sortOrder.accessor;
  let sortMe = sortOrder.sortOrder === 'down' ? 1 : -1
  let data  = tableData.slice().sort((a, b) => {
      a = a[sortKey]
      b = b[sortKey]
      return (a === b ? 0 : a > b ? 1*sortMe : -1*sortMe) 
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

