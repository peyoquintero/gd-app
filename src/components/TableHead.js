import { useState } from "react";

const TableHead = ({ columns }) => {
    return (
     <thead>
      <tr>
       {columns.map(({ label, accessor, width }) => {
        return (
         <th key={accessor} style={{width:width}} >
          {label}
         </th>
        );
       })}
      </tr>
     </thead>
    );
   };

   export default TableHead;