import { useState,useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { compareNumAlphas } from "./helpers"


const Table = ({ data, columns }) => {
const [tableData, setTableData] = useState(data);
const [sortOrder,setSortOrder] = useState({accessor:columns[0].accessor,sortOrder:'down'})
useEffect(() => { setTableData(data) }, [data]);
useEffect(() => { 
  let sortKey = sortOrder.accessor;
  let sortDescending = sortOrder.sortOrder === 'down' ? 1 : -1
  let data  = tableData.slice().sort((a, b) => {
      a = a[sortKey]
      b = b[sortKey]
      let x = compareNumAlphas(a,b)
      return (a === b ? 0 :  x * sortDescending) 
    });

  setTableData(data);
}, [sortOrder]);

return (
    <>
      <table>
        <TableHead {...{ columns, setSortOrder, sortOrder}} />
        <TableBody {...{ tableData, columns  }} />
      </table>
    </>
  );
};

export default Table;

