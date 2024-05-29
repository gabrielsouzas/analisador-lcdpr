import { municipios } from '../assets/municipios.js';

// Verifica se o código passado existe na tabela de municipios e retorna o nome
export function validarMunicipio(codigo) {
  try {
    const searchCode = Number(codigo);
    if (isNaN(searchCode)) {
      return `Código inválido ou não encontrado`;
    }

    const nomeMunicipio = municipios.find((mun) => mun.COD_MUN === searchCode);

    if (!nomeMunicipio) {
      return `Código inválido ou não encontrado`;
    }

    return nomeMunicipio.NOM_MUN;
  } catch (error) {
    console.log(`Erro ao validar código do município. Erro: ${error.message}`);
    return `Código inválido ou não encontrado`;
  }
}

// Verifica se a linha possui caracteres inválidos, como um espaço não separável (160)
export function identificarCaracteresEspeciais(texto) {
  try {
    /*const caracteresProblema = [
      /*9, 13, 10, 160, 173, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200,
      8201, 8202, 8203, 8204, 8205, 8206, 8207, 8239, */ /*160,
      65533,
    ];

    for (let i = 0; i < texto.length; i++) {
      const charCode = texto.charCodeAt(i);
      if (caracteresProblema.includes(charCode)) {
        return `Posição ${i}: '${texto[i]}' -> ${charCode}`;
      }
    }
    */
    for (let i = 0; i < texto.length; i++) {
      const charCode = texto.charCodeAt(i);
      if (charCode === 65533) {
        return {
          erro: `Caractere inválido. Posição ${i}: '${texto[i]}' -> Código caractere: ${charCode}. Tente converter o arquivo para UTF-8`,
          valor: texto[i],
        };
      }
      if (charCode === 160) {
        return {
          erro: `Espaço com caractere inválido invisível. Posição ${i}: '${texto[i]}' -> ${charCode}. Tente fazer uma substituição automática do caractere.`,
          valor: texto[i],
        };
      }
    }
  } catch (error) {
    console.log(`Erro ao validar caracteres da linha. Erro: ${error.message}`);
  }
}
