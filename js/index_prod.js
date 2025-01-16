import { municipios } from '../assets/municipios.js';
import { normalizeString } from '../utils/format.js';
import {
  identificarCaracteresEspeciais,
  validarMunicipio,
} from '../utils/validation.js';
// const municipios = require('../assets/municipios.js');

const fileInput = document.getElementById('fileInput');
// const output = document.getElementById('output');
// const btnTotais = document.getElementById('btn-totais');
const tableTotais = document.getElementById('table-totais');

var jsonData0000 = [];
var jsonData0010 = [];
var jsonData0030 = [];
var jsonData0040 = [];
var jsonData0045 = [];
var jsonData0050 = [];
var jsonDataQ100 = [];
var jsonDataQ200 = [];
var jsonData9999 = [];

var errorLines = [];

const year = 2023;

var totalEntrada = 0;
var totalSaida = 0;

var sumByMonth = {
  '01': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '02': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '03': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '04': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '05': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '06': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '07': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '08': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  '09': { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  10: { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  11: { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
  12: { ENTRADA: 0, SAIDA: 0, SALDO: 0 },
};

const expectedLineLengths = {
  '0000': 10,
  '0010': 2,
  '0030': 10,
  '0040': 17,
  '0045': 6,
  '0050': 7,
  Q100: 13,
  Q200: 6,
  9999: 7,
};

const fieldLengths = {
  '0000': {
    REG: 4,
    NOME_ESC: 5,
    COD_VER: 4,
    CPF: 11,
    NOME: 999,
    IND_SIT_INI_PER: 1,
    SIT_ESPECIAL: 1,
    DT_SIT_ESP: 8,
    DT_INI: 8,
    DT_FIN: 8,
  },
  '0010': {
    REG: 4,
    FORMA_APUR: 1,
  },
  '0030': {
    REG: 4,
    ENDERECO: 150,
    NUM: 6,
    COMPL: 50,
    BAIRRO: 50,
    UF: 2,
    COD_MUN: 7,
    CEP: 8,
    NUM_TEL: 15,
    EMAIL: 115,
  },
  '0040': {
    REG: 4,
    COD_IMOVEL: 3,
    PAIS: 2,
    MOEDA: 3,
    CAD_ITR: 8,
    CAEPF: 14,
    INSCR_ESTADUAL: 14,
    NOME_IMOVEL: 50,
    ENDERECO: 150,
    NUM: 6,
    COMPL: 50,
    BAIRRO: 50,
    UF: 2,
    COD_MUN: 7,
    CEP: 8,
    TIPO_EXPLORACAO: 1,
    PARTICIPACAO: 5,
  },
  '0045': {
    REG: 4,
    COD_IMÓVEL: 3,
    TIPO_CONTRAPARTE: 1,
    ID_CONTRAPARTE: 14,
    NOME_CONTRAPARTE: 50,
    PERC_CONTRAPARTE: 5,
  },
  '0050': {
    REG: 4,
    COD_CONTA: 3,
    PAIS_CTA: 3,
    BANCO: 3,
    NOME_BANCO: 30,
    AGENCIA: 4,
    NUM_CONTA: 16,
  },
  Q100: {
    REG: 4,
    DATA: 8,
    COD_IMOVEL: 3,
    COD_CONTA: 3,
    NUM_DOC: 999,
    TIPO_DOC: 1,
    HIST: 999,
    ID_PARTIC: 14,
    TIPO_LANC: 1,
    VL_ENTRADA: 19,
    VL_SAIDA: 19,
    SLD_FIN: 19,
    NAT_SLD_FIN: 1,
  },
  Q200: {
    REG: 4,
    MÊS: 6,
    VL_ENTRADA: 19,
    VL_SAIDA: 19,
    SLD_FIN: 19,
    NAT_SLD_FIN: 1,
  },
  9999: {
    REG: 4,
    IDENT_NOM: 999,
    IDENT_CPF_CNPJ: 14,
    IND_CRC: 999,
    EMAIL: 115,
    FONE: 15,
    QTD_LIN: 30,
  },
};

// Ativa o comportamento de abas
export function tabClick(id) {
  try {
    const navLinks = document.querySelectorAll('.nav-link');

    // Remove a classe 'active' de todos os links de navegação
    navLinks.forEach((link) => {
      link.classList.remove('active');
    });

    // Adiciona a classe 'active' apenas ao link correspondente à aba selecionada
    const selectedNavLink = document.querySelector(`#link-${id}`);
    selectedNavLink.classList.add('active');

    const tabs = document.querySelectorAll('.tab-pane');
    tabs.forEach((tab) => {
      tab.classList.remove('show', 'active');
    });

    const selectedTab = document.querySelector(`#tab-${id}`);
    selectedTab.classList.add('show', 'active');
  } catch (error) {
    console.log(`Erro ao gerenciar abas. Erro: ${error.message}`);
  }
}

window.tabClick = tabClick;

fileInput.addEventListener('change', function (e) {
  try {
    clearData();
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const lines = e.target.result.split('\n');
      processFileLines(lines);
      createTotalTable();
      insert0030Values();
      insert0040Values();
      insert0050Values();
    };

    showTabs();
    reader.readAsText(file);
  } catch (error) {
    console.log(`Erro ao extrair valores. Erro: ${error.message}`);
  }
});

// Limpar memória e resetar variáveis antes de processar novo arquivo
function clearData() {
  try {
    jsonData0000 = [];
    jsonData0010 = [];
    jsonData0030 = [];
    jsonData0040 = [];
    jsonData0045 = [];
    jsonData0050 = [];
    jsonDataQ100 = [];
    jsonDataQ200 = [];
    jsonData9999 = [];

    errorLines = [];

    totalEntrada = 0;
    totalSaida = 0;

    resetDOMElements();
  } catch (error) {
    console.log(`Erro ao limpar dados carregados. Erro: ${error.message}`);
  }
}

function resetDOMElements() {
  try {
    const tableContainer0050 = document.getElementById('0050-container');
    const tableContainer0040 = document.getElementById('0040-container');
    const tableTotaisBody = document.getElementById('table-totais-body');
    tableContainer0050.innerHTML = '';
    tableContainer0040.innerHTML = '';
    tableTotaisBody.innerHTML = '';
    // Resetar outras áreas do DOM conforme necessário
  } catch (error) {
    console.log(`erro ao resetar elementos do DOM. Erro: ${error.message}`);
  }
}

function processFileLines(lines) {
  try {
    let auxSumEntrada = 0;
    let auxSumSaida = 0;
    let auxSaldo = 0;
    let contLine = 1;

    lines.forEach((line) => {
      const values = line.split('|');

      const validateLineCharacters = identificarCaracteresEspeciais(line);
      if (validateLineCharacters) {
        addError(
          contLine,
          validateLineCharacters.erro,
          validateLineCharacters.valor,
          line
        );
        console.log(
          `Erro de escrita na linha de número: ${contLine}, caracteres inválidos encontrados. Texto da linha: ${line}`
        );
      }

      if (!validateFieldLength(line, contLine)) {
        console.log(
          `Erro de tamanho de campo na linha de número: ${contLine}. Texto da linha: ${line}`
        );
        // return;
      }

      if (!validateLine(values)) {
        addError(contLine, `Erro de layout`, 'Campo não identificado', line);
        console.log(
          `Erro de layout na linha de número: ${contLine}. Texto da linha: ${line}`
        );
        // return;
      }

      switch (values[0]) {
        case '0000':
          process0000(values);
          break;
        case '0010':
          process0010(values);
          break;
        case '0030':
          process0030(values);
          break;
        case '0040':
          process0040(values);
          break;
        case '0045':
          process0045(values);
          break;
        case '0050':
          process0050(values);
          break;
        case 'Q100':
          ({ auxSumEntrada, auxSumSaida, auxSaldo } = processQ100(
            values,
            auxSumEntrada,
            auxSumSaida,
            auxSaldo
          ));
          break;
        case 'Q200':
          processQ200(values);
          break;
        case '9999':
          process9999(values);
          break;
        default:
          console.log(`Registro não reconhecido: ${values[0]}`);
      }

      contLine += 1;
    });

    compararTotalizadores();

    if (errorLines.length > 0) {
      showErrors();
    } else {
      showSuccess();
    }
  } catch (error) {
    console.log(`Erro ao processar linhas. Erro: ${error.message}`);
  }
}

function compararTotalizadores() {
  try {
    jsonDataQ200.forEach((month) => {
      const monthIndex = month.MES.substr(0, 2);
      const entradaSumByMonth = sumByMonth[monthIndex].ENTRADA;
      const saidaSumByMonth = sumByMonth[monthIndex].SAIDA;
      const saldoSumByMonth = sumByMonth[monthIndex].SALDO;

      if (formatToNumber(month.VL_ENTRADA) !== entradaSumByMonth) {
        addError(
          'Q200',
          `Diferença na somatória das Entradas do arquivo para o totalizador no bloco Q200. o valor somado: ${entradaSumByMonth} é diferente do valor no arquivo: ${month.VL_ENTRADA}`,
          month.VL_ENTRADA,
          `Q200|${month.MES}|${month.VL_ENTRADA}|${month.VL_SAIDA}|${month.SLD_FIN}|${month.NAT_SLD_FIN}`
        );
      }

      if (formatToNumber(month.VL_SAIDA) !== saidaSumByMonth) {
        addError(
          'Q200',
          `Diferença na somatória das Saídas do arquivo para o totalizador no bloco Q200. o valor somado: ${saidaSumByMonth} é diferente do valor no arquivo: ${month.VL_SAIDA}`,
          month.VL_SAIDA,
          `Q200|${month.MES}|${month.VL_ENTRADA}|${month.VL_SAIDA}|${month.SLD_FIN}|${month.NAT_SLD_FIN}`
        );
      }

      if (formatToNumber(month.SLD_FIN) !== saldoSumByMonth) {
        addError(
          'Q200',
          `Diferença na somatória dos Saldos do arquivo para o totalizador no bloco Q200. o valor somado: ${saldoSumByMonth} é diferente do valor no arquivo: ${month.SLD_FIN}`,
          month.SLD_FIN,
          `Q200|${month.MES}|${month.VL_ENTRADA}|${month.VL_SAIDA}|${month.SLD_FIN}|${month.NAT_SLD_FIN}`
        );
      }
    });
  } catch (error) {
    console.log(`Erro ao comparar totalizadores. Erro: ${error.message}`);
  }
}

function validateLine(values) {
  return values.length === (expectedLineLengths[values[0]] || 0);
}

function validateFieldLength(line, lineNumber) {
  const values = line.trim().split('|');
  const type = values[0];
  const fieldSpec = fieldLengths[type];

  if (!fieldSpec) {
    addError(lineNumber, 'Tipo de linha não reconhecido', type, line);
    console.error(
      `Tipo de linha não reconhecido: ${type}. Linha: ${lineNumber}`
    );
    return null;
  }

  const fieldNames = Object.keys(fieldSpec);
  //const obj = {};
  let isValid = true;

  fieldNames.forEach((field, index) => {
    const value = values[index] || '';
    const maxLength = fieldSpec[field];
    if (value.length > maxLength) {
      addError(
        lineNumber,
        `O campo ${field} com o comprimento ${value.length} excede o comprimento máximo de ${maxLength}`,
        value,
        line
      );
      console.error(
        `Campo ${field} com o valor ${value} e com o comprimento ${value.length} na linha ${type} excede o comprimento máximo de ${maxLength}. Linha: ${line}`
      );
      isValid = false;
    }
    //obj[field] = value;
  });

  return isValid; //? obj : null;
}

function addError(lineNumber, error, field, lineText) {
  const errorObj = {
    Linha: lineNumber,
    Erro: error,
    'Valor Campo': field,
    'Texto Linha': lineText,
  };
  errorLines.push(errorObj);
}

function showErrors() {
  try {
    if (errorLines.length > 0) {
      const errorContainer = document.getElementById('errors-container');
      errorContainer.classList.remove('desactive');

      const errorLineContainer = document.getElementById(
        'error-line-container'
      );

      const errorsTable = createTable(errorLines, 'rgb(229 156 164)');
      errorLineContainer.appendChild(errorsTable);
    }
  } catch (error) {
    console.log(`Erro ao mostrar erros do arquivo. Erro: ${error.message}`);
  }
}

function showSuccess() {
  try {
    if (errorLines.length === 0) {
      const successContainer = document.getElementById('success-container');
      successContainer.classList.remove('desactive');
    }
  } catch (error) {
    console.log(
      `Erro verificar se o arquivo possui erros. Erro: ${error.message}`
    );
  }
}

/*function validateFieldLengths(type, values) {
  const expectedLengths = fieldLengths[type];
  if (!expectedLengths) {
    console.log(`Tipo de linha não reconhecido: ${type}`);
    return false;
  }

  return Object.keys(expectedLengths).every((key, index) => {
    if (!values[index]) return false; // Verifica se o valor existe
    return values[index].length <= expectedLengths[key];
  });
}*/

function process0000(values) {
  try {
    const obj = {
      REG: values[0],
      NOME_ESC: values[1],
      COD_VER: values[2],
      CPF: values[3],
      NOME: values[4],
      IND_SIT_INI_PER: values[5],
      SIT_ESPECIAL: values[6],
      DT_SIT_ESP: values[7],
      DT_INI: values[8],
      DT_FIN: values[9],
    };
    jsonData0000.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function process0010(values) {
  try {
    const obj = {
      REG: values[0],
      FORMA_APUR: values[1],
    };
    jsonData0010.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function process0030(values) {
  try {
    const obj = {
      REG: values[0],
      ENDERECO: values[1],
      NUM: values[2],
      COMPL: values[3],
      BAIRRO: values[4],
      UF: values[5],
      COD_MUN: values[6],
      NOME_MUN: validarMunicipio(values[6]),
      CEP: values[7],
      NUM_TEL: values[8],
      EMAIL: values[9],
    };
    jsonData0030.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function process0040(values) {
  try {
    const obj = {
      REG: values[0],
      COD_IMOVEL: values[1],
      PAIS: values[2],
      MOEDA: values[3],
      CAD_ITR: values[4],
      CAEPF: values[5],
      INSCR_ESTADUAL: values[6],
      NOME_IMOVEL: values[7],
      ENDERECO: values[8],
      NUM: values[9],
      COMPL: values[10],
      BAIRRO: values[11],
      UF: values[12],
      COD_MUN: values[13],
      NOME_MUN: validarMunicipio(values[13]),
      CEP: values[14],
      TIPO_EXPLORACAO: values[15],
      PARTICIPACAO: values[16],
    };
    jsonData0040.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function process0045(values) {
  try {
    const obj = {
      REG: values[0],
      COD_IMOVEL: values[1],
      TIPO_CONTRAPARTE: values[2],
      ID_CONTRAPARTE: values[3],
      NOME_CONTRAPARTE: values[4],
      PERC_CONTRAPARTE: values[5],
    };
    jsonData0045.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function process0050(values) {
  try {
    const obj = {
      REG: values[0],
      COD_CONTA: values[1],
      PAIS_CTA: values[2],
      BANCO: values[3],
      NOME_BANCO: values[4],
      AGENCIA: values[5],
      NUM_CONTA: values[6],
    };
    jsonData0050.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function processQ100(values, auxSumEntrada, auxSumSaida, auxSaldo) {
  try {
    const entrada = formatToNumber(values[9]);
    const saida = formatToNumber(values[10]);

    auxSumEntrada += entrada;
    auxSumSaida += saida;
    auxSaldo += entrada - saida;

    addMonthValueOnArraySum(values[1], entrada, saida, auxSaldo);

    const obj = {
      REG: values[0],
      DATA: values[1],
      COD_IMOVEL: values[2],
      COD_CONTA: values[3],
      NUM_DOC: values[4],
      TIPO_DOC: values[5],
      HIST: values[6],
      ID_PARTIC: values[7],
      TIPO_LANC: values[8],
      VL_ENTRADA: entrada,
      VL_SAIDA: saida,
      SLD_FIN: values[11],
      NAT_SLD_FIN: values[12],
      SUM_ENTRADA: auxSumEntrada,
      SUM_SAIDA: auxSumSaida,
    };

    totalEntrada = auxSumEntrada;
    totalSaida = auxSumSaida;
    jsonDataQ100.push(obj);

    return { auxSumEntrada, auxSumSaida, auxSaldo };
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function processQ200(values) {
  try {
    const obj = {
      REG: values[0],
      MES: values[1],
      VL_ENTRADA: values[2],
      VL_SAIDA: values[3],
      SLD_FIN: values[4],
      NAT_SLD_FIN: values[5],
    };
    jsonDataQ200.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

function process9999(values) {
  try {
    const obj = {
      REG: values[0],
      IDENT_NOM: values[1],
      IDENT_CPF_CNPJ: values[2],
      IND_CRC: values[3],
      EMAIL: values[4],
      FONE: values[5],
      QTD_LIN: values[6],
    };
    jsonData9999.push(obj);
  } catch (error) {
    console.log(
      `Erro ao processar dados do registro ${values[0]}`,
      error.message
    );
  }
}

/*function validateFieldLength(expectedLength, field) {
  return field.length <= expectedLength;
}*/

/*fileInput.addEventListener('change', function (e) {
  try {
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.onload = function (e) {
      let lines = e.target.result.split('\n');

      let aux_sum_entrada = 0;
      let aux_sum_saida = 0;

      for (let i = 0; i < lines.length; i++) {
        let values = lines[i].split('|');

        // Crie um objeto JSON para cada linha
        // REG |DATA |COD_IMÓVEL |COD_CONTA |NUM_DOC |TIPO_DOC |HIST |ID_PARTIC|TIPO_LANC |VL_ENTRADA |VL_SAIDA |SLD_FIN|NAT_SLD_FIN|
        if (values[0] === 'Q100') {
          aux_sum_entrada += formatToNumber(values[9]);
          aux_sum_saida += formatToNumber(values[10]);

          // Separa por data

          addMonthValueOnArraySum(
            values[1],
            formatToNumber(values[9]),
            formatToNumber(values[10])
          );

          let obj = {
            REG: values[0],
            DATA: values[1],
            COD_IMOVEL: values[2],
            COD_CONTA: values[3],
            NUM_DOC: values[4],
            TIPO_DOC: values[5],
            HIST: values[6],
            ID_PARTIC: values[7],
            TIPO_LANC: values[8],
            VL_ENTRADA: formatToNumber(values[9]),
            VL_SAIDA: formatToNumber(values[10]),
            SLD_FIN: values[11],
            NAT_SLD_FIN: values[12],
            SUM_ENTRADA: aux_sum_entrada,
            SUM_SAIDA: aux_sum_saida,
          };

          totalEntrada = aux_sum_entrada;
          totalSaida = aux_sum_saida;

          // Adicione o objeto ao array jsonDataQ100
          jsonDataQ100.push(obj);
        }

        if (values[0] === '0030') {
          let obj = {
            REG: values[0],
            ENDERECO: values[1],
            NUM: values[2],
            COMPL: values[3],
            BAIRRO: values[4],
            UF: values[5],
            COD_MUN: values[6],
            CEP: values[7],
            NUM_TEL: values[8],
            EMAIL: values[9],
          };

          jsonData0030.push(obj);
        }

        if (values[0] === '0040') {
          let obj = {
            REG: values[0],
            COD_IMOVEL: values[1],
            PAIS: values[2],
            MOEDA: values[3],
            CAD_ITR: values[4],
            CAEPF: values[5],
            INSCR_ESTADUAL: values[6],
            NOME_IMOVEL: values[7],
            ENDERECO: values[8],
            NUM: values[9],
            COMPL: values[10],
            BAIRRO: values[11],
            UF: values[12],
            COD_MUN: values[13],
            CEP: values[14],
            TIPO_EXPLORACAO: values[15],
            PARTICIPACAO: values[16],
          };

          jsonData0040.push(obj);
        }

        if (values[0] === '0050') {
          let obj = {
            REG: values[0],
            COD_CONTA: values[1],
            PAIS_CTA: values[2],
            BANCO: values[3],
            NOME_BANCO: values[4],
            AGENCIA: values[5],
            NUM_CONTA: values[6],
          };

          jsonData0050.push(obj);
        }
      }

      // Imprima o JSON no console
      //console.log(jsonData0040);
      // console.log(sumByMonth);

      createTotalTable();
      insert0030Values();
      insert0040Values();
      insert0050Values();

    };

    showTabs();

    reader.readAsText(file);
  } catch (error) {
    console.log(`Erro ao extrair valores. Erro: ${error.message}`);
  }
});*/

// Formta um valor númérico de acordo com o LCDPR que vêm sem virgulas, para um valor numérico real
const formatToNumber = (value) => {
  try {
    const splitAndConcat = `${value.substr(0, value.length - 2)}.${value.substr(
      value.length - 2,
      2
    )}`;
    return Number(splitAndConcat);
  } catch (error) {
    console.log(`Erro ao formatar valores. Erro: ${error.message}`);
    return value;
  }
};

const createTotalTable = () => {
  try {
    const tableTotaisBody = document.getElementById('table-totais-body');

    if (jsonDataQ100.length > 0) {
      for (let month in sumByMonth) {
        if (sumByMonth.hasOwnProperty(month)) {
          const data = [
            sumByMonth[month].ENTRADA,
            sumByMonth[month].SAIDA,
            sumByMonth[month].SALDO,
          ];

          const row = tableTotaisBody.insertRow();
          const cellMonth = row.insertCell();
          cellMonth.textContent = `${month}/${year}`;

          data.forEach((item) => {
            const cell = row.insertCell();
            cell.textContent = formatToMoney(item);
          });
        }
      }

      // Totais
      const tot = [totalEntrada, totalSaida, totalEntrada - totalSaida];

      const row = tableTotaisBody.insertRow();
      const cellMonth = row.insertCell();
      cellMonth.textContent = `TOTAIS`;
      cellMonth.style.backgroundColor = '#fdffb6';

      tot.forEach((item) => {
        const cell = row.insertCell();
        cell.textContent = formatToMoney(item);
        cell.style.backgroundColor = '#fdffb6';
      });

      // Ordenar tabela
      sortTable(0);
    }
  } catch (error) {
    console.log(`Erro ao gerar tabela de totais. Erro: ${error.message}`);
  }
};

const insert0030Values = () => {
  try {
    if (jsonData0030.length > 0) {
      const enderecoInput = document.getElementById('0030-endereco');
      const numInput = document.getElementById('0030-num');
      const complInput = document.getElementById('0030-compl');
      const bairroInput = document.getElementById('0030-bairro');
      const ufInput = document.getElementById('0030-uf');
      const cod_munInput = document.getElementById('0030-cod_mun');
      const nome_munInput = document.getElementById('0030-nome_mun');
      const cepInput = document.getElementById('0030-cep');
      const num_telInput = document.getElementById('0030-num_tel');
      const emailInput = document.getElementById('0030-email');

      enderecoInput.value = jsonData0030[0].ENDERECO;
      numInput.value = jsonData0030[0].NUM;
      complInput.value = jsonData0030[0].COMPL;
      bairroInput.value = jsonData0030[0].BAIRRO;
      ufInput.value = jsonData0030[0].UF;
      cod_munInput.value = jsonData0030[0].COD_MUN;
      nome_munInput.value = jsonData0030[0].NOME_MUN;
      cepInput.value = jsonData0030[0].CEP;
      num_telInput.value = jsonData0030[0].NUM_TEL;
      emailInput.value = jsonData0030[0].EMAIL;

      // Versão antiga
      /* enderecoDiv.appendChild(createLabel(jsonData0030[0].ENDERECO));
      numDiv.appendChild(createLabel(jsonData0030[0].NUM));
      complDiv.appendChild(createLabel(jsonData0030[0].COMPL));
      bairroDiv.appendChild(createLabel(jsonData0030[0].BAIRRO));
      ufDiv.appendChild(createLabel(jsonData0030[0].UF));
      cod_munDiv.appendChild(createLabel(jsonData0030[0].COD_MUN));
      cepDiv.appendChild(createLabel(jsonData0030[0].CEP));
      num_telDiv.appendChild(createLabel(jsonData0030[0].NUM_TEL));
      emailDiv.appendChild(createLabel(jsonData0030[0].EMAIL));*/
    }
  } catch (error) {
    console.log(
      `Erro ao gerar valores para o registro 0030. Erro: ${error.message}`
    );
  }
};

const insert0040Values = () => {
  try {
    if (jsonData0040.length > 0) {
      const tableContainer = document.getElementById('0040-container');
      const table = createTable(jsonData0040);
      tableContainer.appendChild(table);
    }
  } catch (error) {
    console.log(
      `Erro ao gerar valores para o registro 0030. Erro: ${error.message}`
    );
  }
};

const insert0050Values = () => {
  try {
    if (jsonData0050.length > 0) {
      const tableContainer = document.getElementById('0050-container');
      const table = createTable(jsonData0050);
      tableContainer.appendChild(table);
    }
  } catch (error) {
    console.log(
      `Erro ao gerar valores para o registro 0030. Erro: ${error.message}`
    );
  }
};

// Função para criar uma tabela HTML
function createTable(data, headerColor = '#a6bbd9') {
  try {
    // Cria a tabela
    const table = document.createElement('table');
    table.classList.add('table');
    table.classList.add('table-striped');
    table.classList.add('table-bordered');
    table.classList.add('table-hover');

    // Cria o cabeçalho da tabela
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    for (const key in data[0]) {
      const headerCell = document.createElement('th');
      headerCell.id = key.replace(' ', '');
      headerCell.textContent = key;
      headerCell.style.backgroundColor = headerColor;
      headerRow.appendChild(headerCell);
    }

    // Adiciona os dados à tabela
    const tbody = document.createElement('tbody');
    data.forEach((item) => {
      const row = tbody.insertRow();
      for (const key in item) {
        const cell = row.insertCell();
        cell.classList.add('vertical-align-middle');
        cell.textContent = item[key];
      }
    });
    table.appendChild(tbody);

    return table;
  } catch (error) {
    console.log(`Erro ao criar tabela. Erro: ${error.message}`);
  }
}

const createLabel = (content) => {
  try {
    const label = document.createElement('label');
    label.textContent = content;
    return label;
  } catch (error) {
    console.log(`Erro ao gerar label. Erro: ${error.message}`);
  }
};

const formatToMoney = (value) => {
  try {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  } catch (error) {
    console.log(`Erro ao formatar valor para moeda. Erro: ${error.message}`);
  }
};

const addMonthValueOnArraySum = (data, entrada, saida, auxSaldo) => {
  try {
    const month = data.substr(2, 2);
    const sumEntrada = parseFloat(sumByMonth[month].ENTRADA + entrada).toFixed(
      2
    );
    const sumSaida = parseFloat(sumByMonth[month].SAIDA + saida).toFixed(2);
    const sumSaldo = parseFloat(auxSaldo).toFixed(2);

    sumByMonth[month].ENTRADA = Number(sumEntrada);
    sumByMonth[month].SAIDA = Number(sumSaida);
    sumByMonth[month].SALDO = Number(sumSaldo);
  } catch (error) {
    console.log(`Erro ao somar valores por mês. Erro: ${error.message}`);
  }
};

// saldo = entrada - saida + saldo

function sortTable(n) {
  var table,
    rows,
    switching,
    i,
    x,
    y,
    shouldSwitch,
    dir,
    switchcount = 0;
  // table = document.getElementById("myTable");
  switching = true;
  // Definir a direção inicial como ascendente:
  dir = 'asc';

  while (switching) {
    switching = false;
    rows = tableTotais.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName('TD')[n];
      y = rows[i + 1].getElementsByTagName('TD')[n];

      if (dir == 'asc') {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == 'desc') {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == 'asc') {
        dir = 'desc';
        switching = true;
      }
    }
  }
}

const showTabs = () => {
  const container0030 = document.getElementById('0030-container');
  const container0040 = document.getElementById('0040-container');
  const container0050 = document.getElementById('0050-container');
  const containerTotais = document.getElementById('totais-container');
  const cadastroTitle = document.getElementById('cadastro-tab-title');

  cadastroTitle.classList.add('desactive-tab-text');

  container0030.classList.remove('desactive-tab-text');
  // container0030.classList.add('d-flex', 'flex-column', 'align-items-center');

  container0040.classList.remove('desactive-tab-text');
  container0050.classList.remove('desactive-tab-text');
  containerTotais.classList.remove('desactive-tab-text');
};

// Busca de municipio

const btnSearchMun = document.getElementById('btnSearchMunicipio');

btnSearchMun.addEventListener('click', () => {
  try {
    const municipiosSearchResult = document.getElementById('municipios-result');
    const inputSearchMun = document.getElementById('inputSearchMunicipio');
    const selSearchMun = document.getElementById('selSearchMunicipio');

    var municipio = [{}];

    if (inputSearchMun.value !== null && inputSearchMun.value.length > 0) {
      if (selSearchMun.value === 'code') {
        const searchCode = Number(inputSearchMun.value);
        if (!isNaN(searchCode)) {
          municipio[0] = municipios.find((mun) => mun.COD_MUN === searchCode);
        } else {
          alert(
            `Digite um código numérico para buscar o município por código.`
          );
          console.log(`Erro ao buscar municipio. Código inválido`);
        }
      } else {
        municipio = municipios.filter((mun) => {
          return normalizeString(mun.NOM_MUN).includes(
            normalizeString(inputSearchMun.value)
          );
        });
      }

      if (municipio.length > 0) {
        const tableMunicipiosResult = createTable(municipio);
        municipiosSearchResult.innerHTML = '';
        municipiosSearchResult.appendChild(tableMunicipiosResult);
      } else {
        alert('Nenhum município encontrado!');
      }
    } else {
      alert(`Digite um código ou nome de um município para pesquisar.`);
      console.log(`Erro ao buscar municipio. Busca em branco`);
    }
  } catch (error) {
    console.log(`Erro ao buscar município. Erro: ${error.message}`);
  }
});
