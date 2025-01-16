// Remove acentuação e coloca em minusculo
export function normalizeString(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Formta um valor númérico de acordo com o LCDPR que vêm sem virgulas, para um valor numérico real
export const formatToNumber = (value) => {
  try {
    const splitAndConcat = `${value.substr(0, value.length - 2)}.${value.substr(value.length - 2, 2)}`;
    return Number(splitAndConcat);
  } catch (error) {
    console.log(`Erro ao formatar valores. Erro: ${error.message}`);
    return value;
  }
};

export const formatToMoney = (value) => {
  try {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  } catch (error) {
    console.log(`Erro ao formatar valor para moeda. Erro: ${error.message}`);
    return value;
  }
};
