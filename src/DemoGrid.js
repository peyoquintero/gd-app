import React, { Component, useState  } from 'react';

function filteredGData(props) {
    let filterKey = props.filterKey && props.filterKey.toLowerCase()
    let sortOrders= props.columns.reduce((o, key) => ((o[key] = 1), o), {})
    const order = sortOrders[props.sortKey] || 1
    let data = props.data.filter(w=>(props.excludeChar==="") || (w.Codigo.indexOf(props.excludeChar) === -1))
    if (filterKey) {
      data = data.filter((row) => {
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
      data = data.slice().sort((a, b) => {
        a = a[props.sortKey]
        b = b[props.sortKey]
        return (a === b ? 0 : a > b ? 1 : -1) * order
      })
    }
    return data
  }

  function headerKeyMapping(props,headerKey)
  {
    var index = props.headers.indexOf(headerKey); 
    return props.columns[index];
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
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  
class DemoGrid extends Component { 
    constructor()
    {
        const [data, setData] = useState(props.data); 
        const [sortKey, setSortKey] = useState(props.sortKey); 
    }
    render(){ 
          let filteredData = filteredGData(this.props)
          let myprops = this.props
          if (filteredData.length)
          {
            return( 
            <table>
            <thead>
                {myprops.headers.map((key)=>{return (
                <th style={columnWidth(myprops,key)} 
                onClick={setData(sortBy(filteredData,headerKeyMapping(key)))}
                className={myprops.sortKey === key? 'active':''}> 
                {capitalize(key)}
                </th>)})}
            </thead>
            <tbody>
            {filteredData.map((entry)=>{return (<tr>
                {myprops.columns.map((key)=>entry[key])}
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
}

export default DemoGrid    
