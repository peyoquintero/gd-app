
const TableHead = ({ columns,setSortOrder,sortOrder }) => {
    const onclickHandler = (e) => 
    {
        setSortOrder({accessor:e.currentTarget.getAttribute("data-id"),
                      sortOrder : sortOrder.sortOrder === 'down' ? 'up' : 'down'
        });
    };
    const getArrowIcon = (accessor) => {
        if (sortOrder.accessor === accessor) {
          return sortOrder.sortOrder === 'down' ? '▼' : '▲';
        }
        return null;
      };

    return (
     <thead>
      <tr>
       {columns.map(({ label, accessor, width }) => {
        return (
         <th key={accessor} style={{width:width}}  onClick={onclickHandler} data-id={accessor}>
          {label} {getArrowIcon(accessor)}
         </th>
        );
       })}
      </tr>
     </thead>
    );
   };

   export default TableHead;