import { useState } from "react";

const TableHead = ({ columns }) => {
    return (
     <thead>
      <tr>
       {columns.map(({ label, accessor, width }) => {
        return (
         <th key={accessor} style={{witdh:width}} >
          {label}
         </th>
        );
       })}
      </tr>
     </thead>
    );
   };

   export default TableHead;