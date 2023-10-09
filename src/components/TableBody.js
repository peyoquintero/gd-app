const TableBody = ({ tableData, columns }) => {
    if (!tableData)
    {return <tbody></tbody>}
    return (
     <tbody>
      {tableData.map((data,index) => {
       return (
        <tr key={index}>
         {columns.map(({accessor},index2) => {
          const tData = data[accessor] ? data[accessor] : "—";
          return <td key={index2}>{tData}</td>;
         })}
        </tr>
       );
      })}
     </tbody>
    );
   };

   export default TableBody;   