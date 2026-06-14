import { parseCleanDataRange } from './Helpers';

const TableBody = ({ tableData, columns }) => {
    if (!tableData)
    {return <tbody></tbody>}

    const { min: minValue, shortMax, longMax } = parseCleanDataRange(localStorage.getItem('cleanDataRange'));

    return (
     <tbody>
      {tableData.map((data,index) => {
       return (
        <tr key={index}>
         {columns.map(({accessor, label},index2) => {
          const tData = data[accessor] ? data[accessor] : "—";

          const rowDias = data.Dias ?? 0;
          const maxForRow = rowDias <= 90 ? shortMax : longMax;
          const isOutsideRange = (accessor === 'Ganancia' || accessor === 'Proyeccion' || label === 'PRY') &&
                                 tData !== "—" &&
                                 (parseInt(tData) <= minValue || parseInt(tData) >= maxForRow);

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