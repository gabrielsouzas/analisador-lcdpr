export var jsonData0000 = [];
export var jsonData0010 = [];
export var jsonData0030 = [];
export var jsonData0040 = [];
export var jsonData0045 = [];
export var jsonData0050 = [];
export var jsonDataQ100 = [];
export var jsonDataQ200 = [];
export var jsonData9999 = [];

export var errorLines = [];

export var totalEntrada = 0;
export var totalSaida = 0;

export var sumByMonth = {
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

export const expectedLineLengths = {
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

export const fieldLengths = {
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
