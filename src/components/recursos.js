export const recursoPorUsuario = (usuario) =>{

    let result = ''
    switch (usuario) {
        case "plq":
            result = "https://sheets.googleapis.com/v4/spreadsheets/1ZfXM4qnajw8QSaxrx6aXKa_xbMDZe3ryWt8E3alSyEE/values/PesajesPorCodigo?key=AIzaSyCGW3gRbBisLX950bZJDylH-_QJTR7ogd8"
          break;
         case "hma":
          result = "https://sheets.googleapis.com/v4/spreadsheets/1f-B5ULMd6ndihTaVVcOayREjH-3vPvfBYRddhD5CPHY/values/Hoja1?key=AIzaSyCzqrsa9n6p9qwl_2KN6R-HzX6DCPvp0Uk"
          break;
          default:
            result = "" 
        break;
    }

    return result; 
}
