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

export function validateCPF(cpf) {
  try {
    let sum = 0;
    let remainder;

    if (cpf === '00000000000') {
      return { message: 'CPF inválido', response: false };
    }

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(9, 10))) {
      return { message: 'CPF inválido', response: false };
    }

    sum = 0;

    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;

    if (remainder === 10 || remainder === 11) {
      remainder = 0;
    }

    if (remainder !== parseInt(cpf.substring(10, 11))) {
      return { message: 'CPF inválido', response: false };
    }

    return { message: 'CPF Válido', response: true };
  } catch (error) {
    console.log(`Erro ao validar CPF. Erro: ${error.message}`);
    return { message: 'CPF inválido', response: false };
  }
}

export function validateCNPJ(cnpj) {
  try {
    let sum = 0;
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += numbers.charAt(length - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== parseInt(digits.charAt(0))) {
      return { message: 'CNPJ inválido', response: false };
    }

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += numbers.charAt(length - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== parseInt(digits.charAt(1))) {
      return { message: 'CNPJ inválido', response: false };
    }

    return { message: 'CNPJ Válido', response: true };
  } catch (error) {
    console.log(`Erro ao validar CNPJ. Erro: ${error.message}`);
    return { message: 'CNPJ inválido', response: false };
  }
}

export function validateCPFAndCNPJ(value) {
  try {
    if (!value || typeof value !== 'string') {
      return { message: 'CPF/CNPJ inválido. Valor deve ser uma string', response: false };
    }
    // detecta espaços em branco e retorna uma mensagem de erro
    if (value.includes(' ')) {
      return { message: 'CPF/CNPJ inválido. Valor não pode conter espaços em branco', response: false };
    }
    // value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    // value = value.trim(); // Remove espaços em branco
    if (value.length === 11) {
      return validateCPF(value);
    } else if (value.length === 14) {
      return validateCNPJ(value);
    } else {
      return { message: 'CPF/CNPJ inválido. Tamanho diferente de 11 (CPF) ou 14 (CNPJ)', response: false };
    }
  } catch (error) {
    console.log(`Erro ao validar CPF/CNPJ. Erro: ${error.message}`);
    return 'CPF/CNPJ inválido';
  }
}
