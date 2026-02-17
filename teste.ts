import { exibirNome } from './exibirNome.ts';
import { exibirPonto } from './exibirPonto.ts';

interface Nomeada {
    nome: string;
}

const obj = {
    x: 0,
    y: 0,
    nome: 'Origem'
};

exibirPonto(obj);
exibirNome(obj);
