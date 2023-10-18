import { useState,useEffect } from "react";
import TableBody from "./TableBody";
import TableHead from "./TableHead";
import { compareNumAlphas } from "./Helpers"


const Table = ({ data, columns }) => {
const [tableData, setTableData] = useState(data);
const [sortOrder,setSortOrder] = useState({accessor:columns[0].accessor,sortOrder:'down'})
const isDate = (string) => /^\d{4}-\d{2}-\d{2}$/.test(string.trim());
const compareDate = (a,b) => {return (new Date(a) - new Date(b)) > 0 ? 1 : -1; }

useEffect(() => { setTableData(data) }, [data]);
useEffect(() => { 
  let sortKey = sortOrder.accessor;
  let sortDescending = sortOrder.sortOrder === 'down' ? 1 : -1
  let data  = tableData.slice().sort((a, b) => {
      a = a[sortKey]
      b = b[sortKey]

      let x = isDate(a)? compareDate(a,b) : compareNumAlphas(a,b)
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

