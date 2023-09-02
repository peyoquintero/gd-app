import React, { useState  } from 'react';

function filteredGData(props,gData) {
    let filterKey = props.filterKey && props.filterKey.toLowerCase()
    let sortOrders= props.columns.reduce((o, key) => ((o[key] = 1), o), {})
    const order = sortOrders[props.sortKey] || 1
    let filteredData = gData.filter(w=>(props.excludeChar==="") || (w.Codigo.indexOf(props.excludeChar) === -1))
    if (filterKey) {
        filteredData = filteredData.filter((row) => {
        return Object.keys(row).filter(w=>w!==props.excludeFilter).some((key) => {
          if(!filterKey.includes(";"))
              return String(row[key]).toLowerCase().indexOf(filterKey) > -1
          else
          {
            let included = false;
            let fkeys = filterKey.split(";").filter(w=>w!=='');
            fkeys.forEach(element=>{included = included || (String(row[key]).toLowerCase().indexOf(element) > -1)})
            return included;
          }
        })
      })
    }
    if (props.sortKey) {
        filteredData = filteredData.slice().sort((a, b) => {
        a = a[props.sortKey]
        b = b[props.sortKey]
        return (a === b ? 0 : a > b ? 1 : -1) * order
      })
    }
    return filteredData
  }

  
export const  DemoGrid = (props) =>  { 
//        const [data, setData] = useState(props.data); 
//        const [sortKey, setSortKey] = useState(props.sortKey); 

        function headerKeyMapping(headers,columns,headerKey)
        {
          var index = headers.indexOf(headerKey); 
          return columns[index];
        }
      
        function colwidth(key)
        {
          var index = this.props.headers.indexOf(key); 
          return `column-width:${this.props.headerwidthpct[index]}%`;
        }
      
        function columnWidth(props,key)
        {
          var index = props.headers.indexOf(key); 
          var w = props.headerwidthpct[index];
          const style = {
              width: w 
          };
      
          return style;
      }
      
        function sortBy(filteredData,key) {
          //Todo: data returned??
          filteredData[key] = filteredData[key] * -1
        }
      
        function capitalize(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        }
      
          let filteredData = filteredGData(props,props.data);
          //setData(filteredData);
          if (filteredData.length)
          {
            return( 
            <table>
            <thead>
            <tr>
                {props.headers.map((key)=>{return (
                <th style={columnWidth(props,key)} 
//                onClick={setData(sortBy(filteredData,headerKeyMapping(props.headers,props.columns,key)))}
                onClick={sortBy(filteredData,headerKeyMapping(props.headers,props.columns,key))}
                className={props.sortKey === key? 'active':''}
                key={key}> 
                {capitalize(key)}
                </th>)})}
                </tr>
            </thead>
            <tbody>
            {filteredData.map((entry)=>{
                return (<tr key={entry.Codigo}>
                {props.columns.map((mykey)=>{return(<td key={mykey}>{entry[mykey]}</td>)})}
            </tr>)})}
            </tbody>
          </table>)
          }
          else
          {
            return( 
            <div>
              <h1>No Data to return</h1>
            </div>
          )
            }
        }

        export default DemoGrid;
