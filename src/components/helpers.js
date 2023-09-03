export const filteredGData = (filteredData,filterKeyProp,excludeFilterProp) => {
    let filterKey = filterKeyProp && filterKeyProp.toLowerCase()
    if (filterKey) {
        filteredData = filteredData.filter((row) => {
        return Object.keys(row).filter(w=>w!==excludeFilterProp).some((key) => {
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

    return filteredData;
}
  
  