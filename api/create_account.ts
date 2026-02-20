interface Registro {
    // Adicione as propriedades que você precisa
    nome: string;
    email: string;
    senha: string;
    // ... outras propriedades
}

// Agora USE a interface em algum lugar
function criarRegistro(dados: Registro) {
    console.log('Criando registro:', dados);
}

// Ou exporte se for usar em outros arquivos
export type { Registro };
export type { criarRegistro };