const TableBody = ({ tableData, columns }) => {
    if (!tableData)
    {return <tbody></tbody>}
    return (
     <tbody>
      {tableData.map((data,index) => {
       return (
        <tr key={index}>
         {columns.map(({ accessor }) => {
          const tData = data[accessor] ? data[accessor] : "——";
          return <td key={data[accessor]}>{tData}</td>;
         })}
        </tr>
       );
      })}
     </tbody>
    );
   };

   export default TableBody;   