const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
// const btnTotais = document.getElementById('btn-totais');
const tableTotais = document.getElementById('table-totais');
let jsonDataQ100 = [];
let jsonData0030 = [];
let jsonData0040 = [];
let jsonData0050 = [];
const year = 2023;

var totalEntrada = 0;
var totalSaida = 0;

let sumByMonth = {
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

// Ativa o comportamento de abas
function tabClick(id) {
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
/*var tabEl = document.getElementById('myTab');
var tab = new bootstrap.Tab(tabEl);
tab.show();*/

fileInput.addEventListener('change', function (e) {
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

      // Exiba o JSON formatado na página
      /* document.getElementById('output').innerText = JSON.stringify(
        jsonDataQ100,
        null,
        2
      ); */

      // document.getElementById('output').innerText = 'Dados extraidos com sucesso!';
    };

    showTabs();

    reader.readAsText(file);
  } catch (error) {
    console.log(`Erro ao extrair valores. Erro: ${error.message}`);
  }
});

/* btnTotais.addEventListener('click', () => {
  createTotalTable();
}); */

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
    if (jsonDataQ100.length > 0) {
      for (let month in sumByMonth) {
        if (sumByMonth.hasOwnProperty(month)) {
          const data = [
            sumByMonth[month].ENTRADA,
            sumByMonth[month].SAIDA,
            sumByMonth[month].SALDO,
          ];

          const row = tableTotais.insertRow();
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

      const row = tableTotais.insertRow();
      const cellMonth = row.insertCell();
      cellMonth.textContent = `TOTAIS`;

      tot.forEach((item) => {
        const cell = row.insertCell();
        cell.textContent = formatToMoney(item);
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
      const enderecoDiv = document.getElementById('0030-endereco');
      const numDiv = document.getElementById('0030-num');
      const complDiv = document.getElementById('0030-compl');
      const bairroDiv = document.getElementById('0030-bairro');
      const ufDiv = document.getElementById('0030-uf');
      const cod_munDiv = document.getElementById('0030-cod_mun');
      const cepDiv = document.getElementById('0030-cep');
      const num_telDiv = document.getElementById('0030-num_tel');
      const emailDiv = document.getElementById('0030-email');

      enderecoDiv.appendChild(createLabel(jsonData0030[0].ENDERECO));
      numDiv.appendChild(createLabel(jsonData0030[0].NUM));
      complDiv.appendChild(createLabel(jsonData0030[0].COMPL));
      bairroDiv.appendChild(createLabel(jsonData0030[0].BAIRRO));
      ufDiv.appendChild(createLabel(jsonData0030[0].UF));
      cod_munDiv.appendChild(createLabel(jsonData0030[0].COD_MUN));
      cepDiv.appendChild(createLabel(jsonData0030[0].CEP));
      num_telDiv.appendChild(createLabel(jsonData0030[0].NUM_TEL));
      emailDiv.appendChild(createLabel(jsonData0030[0].EMAIL));
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
function createTable(data) {
  // Cria a tabela
  const table = document.createElement('table');
  table.classList.add('table');
  table.classList.add('table-striped');
  table.classList.add('table-bordered');

  // Cria o cabeçalho da tabela
  const headerRow = table.insertRow();
  for (const key in data[0]) {
    const headerCell = document.createElement('th');
    headerCell.textContent = key;
    headerRow.appendChild(headerCell);
  }

  // Adiciona os dados à tabela
  data.forEach((item) => {
    const row = table.insertRow();
    for (const key in item) {
      const cell = row.insertCell();
      cell.classList.add('vertical-align-middle');
      cell.textContent = item[key];
    }
  });

  return table;
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

const addMonthValueOnArraySum = (data, entrada, saida) => {
  try {
    const month = data.substr(2, 2);
    const sumEntrada = parseFloat(sumByMonth[month].ENTRADA + entrada).toFixed(
      2
    );
    const sumSaida = parseFloat(sumByMonth[month].SAIDA + saida).toFixed(2);
    // console.log(Number(sumEntrada), Number(sumSaida));
    sumByMonth[month].ENTRADA = Number(sumEntrada);
    sumByMonth[month].SAIDA = Number(sumSaida);
    sumByMonth[month].SALDO = Number(sumEntrada) - Number(sumSaida);
  } catch (error) {
    console.log(`Erro ao somar valores por mês. Erro: ${error.message}`);
  }
};

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
  container0030.classList.add('d-flex', 'flex-column', 'align-items-center');

  container0040.classList.remove('desactive-tab-text');
  container0050.classList.remove('desactive-tab-text');
  containerTotais.classList.remove('desactive-tab-text');
};
