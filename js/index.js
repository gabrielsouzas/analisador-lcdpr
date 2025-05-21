import { municipios } from '../assets/municipios.js';
import { formatToMoney, formatToNumber, normalizeString } from '../utils/format.js';
import { identificarCaracteresEspeciais, validarMunicipio, validateCPFAndCNPJ } from '../utils/validation.js';

import {
  errorLines,
  expectedLineLengths,
  fieldLengths,
  jsonData0000,
  jsonData0010,
  jsonData0030,
  jsonData0040,
  jsonData0045,
  jsonData0050,
  jsonData9999,
  jsonDataQ100,
  jsonDataQ200,
  sumByMonth,
} from './constants.js';

let totalSaida = 0;
var totalEntrada = 0;

const fileInput = document.getElementById('fileInput');
const tableTotais = document.getElementById('table-totais');

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
    jsonData0000.length = 0;
    jsonData0010.length = 0;
    jsonData0030.length = 0;
    jsonData0040.length = 0;
    jsonData0045.length = 0;
    jsonData0050.length = 0;
    jsonDataQ100.length = 0;
    jsonDataQ200.length = 0;
    jsonData9999.length = 0;

    errorLines.length = 0;

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
    let contLine = 0;

    lines.forEach((line) => {
      contLine++;
      const values = line.split('|');

      const validateLineCharacters = identificarCaracteresEspeciais(line);
      if (validateLineCharacters) {
        addError(contLine, validateLineCharacters.erro, validateLineCharacters.valor, line);
        console.log(`Erro de escrita na linha de número: ${contLine}, caracteres inválidos encontrados. Texto da linha: ${line}`);
      }

      if (!validateFieldLength(line, contLine)) {
        console.log(`Erro de tamanho de campo na linha de número: ${contLine}. Texto da linha: ${line}`);
        // return;
      }

      if (!validateLine(values)) {
        addError(contLine, `Erro de layout`, 'Campo não identificado', line);
        console.log(`Erro de layout na linha de número: ${contLine}. Texto da linha: ${line}`);
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
          ({ auxSumEntrada, auxSumSaida, auxSaldo } = processQ100(values, line, contLine, auxSumEntrada, auxSumSaida, auxSaldo));
          break;
        case 'Q200':
          processQ200(values, contLine);
          break;
        case '9999':
          process9999(values);
          break;
        default:
          console.log(`Registro não reconhecido: ${values[0]}`);
      }

      // contLine += 1;
    });

    compararTotalizadores();

    verifyNumberOfLines(contLine);

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
          month.LINE_NUMBER,
          `Diferença na somatória das Entradas do arquivo para o totalizador no bloco Q200. o valor somado: ${entradaSumByMonth} é diferente do valor no arquivo: ${month.VL_ENTRADA}`,
          month.VL_ENTRADA,
          `Q200|${month.MES}|${month.VL_ENTRADA}|${month.VL_SAIDA}|${month.SLD_FIN}|${month.NAT_SLD_FIN}`
        );
      }

      if (formatToNumber(month.VL_SAIDA) !== saidaSumByMonth) {
        addError(
          month.LINE_NUMBER,
          `Diferença na somatória das Saídas do arquivo para o totalizador no bloco Q200. o valor somado: ${saidaSumByMonth} é diferente do valor no arquivo: ${month.VL_SAIDA}`,
          month.VL_SAIDA,
          `Q200|${month.MES}|${month.VL_ENTRADA}|${month.VL_SAIDA}|${month.SLD_FIN}|${month.NAT_SLD_FIN}`
        );
      }

      if (formatToNumber(month.SLD_FIN) !== saldoSumByMonth) {
        addError(
          month.LINE_NUMBER,
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

function verifyNumberOfLines(contLine) {
  try {
    const qtdLinhas = Number(jsonData9999[0].QTD_LIN);
    if (qtdLinhas !== contLine) {
      addError(
        contLine,
        `Quantidade de linhas do arquivo diferente da quantidade informada no registro 9999. Quantidade informada: ${qtdLinhas}. Quantidade real: ${contLine}`,
        qtdLinhas,
        `9999|${jsonData9999[0].IDENT_NOM}|${jsonData9999[0].IDENT_CPF_CNPJ}|${jsonData9999[0].IND_CRC}|${jsonData9999[0].EMAIL}|${jsonData9999[0].FONE}|${jsonData9999[0].QTD_LIN}`
      );
    }
  } catch (error) {
    console.log(`Erro ao verificar quantidade de linhas. Erro: ${error.message}`);
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
    console.error(`Tipo de linha não reconhecido: ${type}. Linha: ${lineNumber}`);
    return null;
  }

  const fieldNames = Object.keys(fieldSpec);
  //const obj = {};
  let isValid = true;

  fieldNames.forEach((field, index) => {
    const value = values[index] || '';
    const maxLength = fieldSpec[field];
    if (value.length > maxLength) {
      addError(lineNumber, `O campo ${field} com o comprimento ${value.length} excede o comprimento máximo de ${maxLength}`, value, line);
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

      const errorLineContainer = document.getElementById('error-line-container');

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
    console.log(`Erro verificar se o arquivo possui erros. Erro: ${error.message}`);
  }
}

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
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
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
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
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
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
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
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
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
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
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
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
  }
}

function processQ100(values, lineText, lineNumber, auxSumEntrada, auxSumSaida, auxSaldo) {
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

    verifyIdPartic(values[7], lineText, lineNumber);

    verifyCodConta(values[3], lineText, lineNumber);
    verifyCodImovel(values[2], lineText, lineNumber);

    totalEntrada = auxSumEntrada;
    totalSaida = auxSumSaida;
    jsonDataQ100.push(obj);

    return { auxSumEntrada, auxSumSaida, auxSaldo };
  } catch (error) {
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
  }
}

function processQ200(values, lineNumber) {
  try {
    const obj = {
      REG: values[0],
      MES: values[1],
      VL_ENTRADA: values[2],
      VL_SAIDA: values[3],
      SLD_FIN: values[4],
      NAT_SLD_FIN: values[5],
      LINE_NUMBER: lineNumber,
    };
    jsonDataQ200.push(obj);
  } catch (error) {
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
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
    console.log(`Erro ao processar dados do registro ${values[0]}`, error.message);
  }
}

function verifyIdPartic(idPartic, lineText, lineNumber) {
  try {
    const isValid = validateCPFAndCNPJ(idPartic);
    if (isValid.response) {
      return;
    }
    addError(lineNumber, isValid.message, idPartic, lineText);
  } catch (error) {
    console.log(`Erro ao verificar ID_PARTIC. Erro: ${error.message}`);
  }
}

function verifyCodConta(codConta, lineText, lineNumber) {
  try {
    /* Caso tenha sido pago em espécie, registrar como "000" e, caso utilize numerário em
        trânsito, utilizar o código “999” */
    if (codConta === '000' || codConta === '999') {
      return;
    }
    const exists = jsonData0050.some((obj) => obj['COD_CONTA'] === codConta);
    if (!exists) {
      addError(lineNumber, `Código de conta ${codConta} não foi encontrado nos registros 0050`, codConta, lineText);
    }
  } catch (error) {
    console.log(`Erro ao verificar COD_CONTA. Erro: ${error.message}`);
  }
}

function verifyCodImovel(codImovel, lineText, lineNumber) {
  try {
    const exists = jsonData0040.some((obj) => obj['COD_IMOVEL'] === codImovel);
    if (!exists) {
      addError(lineNumber, `Código de imóvel ${codImovel} não foi encontrado nos registros 0040`, codImovel, lineText);
    }
  } catch (error) {
    console.log(`Erro ao verificar COD_CONTA. Erro: ${error.message}`);
  }
}

const createTotalTable = () => {
  try {
    const tableTotaisBody = document.getElementById('table-totais-body');

    const year = jsonData0000[0].DT_FIN.substr(4, 4);

    if (jsonDataQ100.length > 0) {
      for (let month in sumByMonth) {
        if (Object.prototype.hasOwnProperty.call(sumByMonth, month)) {
          const data = [sumByMonth[month].ENTRADA, sumByMonth[month].SAIDA, sumByMonth[month].SALDO];

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
    }
  } catch (error) {
    console.log(`Erro ao gerar valores para o registro 0030. Erro: ${error.message}`);
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
    console.log(`Erro ao gerar valores para o registro 0030. Erro: ${error.message}`);
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
    console.log(`Erro ao gerar valores para o registro 0030. Erro: ${error.message}`);
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

// const createLabel = (content) => {
//   try {
//     const label = document.createElement('label');
//     label.textContent = content;
//     return label;
//   } catch (error) {
//     console.log(`Erro ao gerar label. Erro: ${error.message}`);
//   }
// };

const addMonthValueOnArraySum = (data, entrada, saida, auxSaldo) => {
  try {
    const month = data.substr(2, 2);
    const sumEntrada = parseFloat(sumByMonth[month].ENTRADA + entrada).toFixed(2);
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
  // eslint-disable-next-line no-unused-vars
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
          alert(`Digite um código numérico para buscar o município por código.`);
          console.log(`Erro ao buscar municipio. Código inválido`);
        }
      } else {
        municipio = municipios.filter((mun) => {
          return normalizeString(mun.NOM_MUN).includes(normalizeString(inputSearchMun.value));
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
