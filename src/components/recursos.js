export const recursoPorUsuario = (usuario) =>{

    let result = ''
    switch (usuario) {
        case "PLQ":
            result = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8"
          break;
         case "HMA":
            result = "" 
            break;
          default:
            result = "" 
        break;
    }

    return result; 
}
