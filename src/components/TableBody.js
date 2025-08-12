const TableBody = ({ tableData, columns }) => {
    if (!tableData)
    {return <tbody></tbody>}

    // Get clean data range parameters
    const getCleanDataRange = () => {
      const cleanDataRange = localStorage.getItem('cleanDataRange') || '-0200/1750';
      const [minValue, maxValue] = cleanDataRange.split('/').map(val => parseInt(val.trim()));
      return { minValue, maxValue };
    };

    const { minValue, maxValue } = getCleanDataRange();

    return (
     <tbody>
      {tableData.map((data,index) => {
       return (
        <tr key={index}>
         {columns.map(({accessor, label},index2) => {
          const tData = data[accessor] ? data[accessor] : "—";

          // Check if this is a Ganancia or PRY column and if value is outside range
          const isOutsideRange = (accessor === 'Ganancia' || accessor === 'Proyeccion' || label === 'PRY') &&
                                 tData !== "—" &&
                                 (parseInt(tData) <= minValue || parseInt(tData) >= maxValue);

          return (
            <td
              key={index2}
              style={isOutsideRange ? { backgroundColor: 'yellow', fontWeight: 'bold' } : {}}
            >
              {tData}
            </td>
          );
         })}
        </tr>
       );
      })}
     </tbody>
    );
   };

   export default TableBody;   