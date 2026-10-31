export class Produto {
  constructor(
    public readonly id: number | null,
    public nome: string,
    public descricao: string | null,
    public codigo: string,
    public preco: number,
    public quantidadeEstoque: number,
    public estoqueMinimo: number,
    public categoriaId: number,
    public fornecedorId: number,
    public readonly criadoEm?: Date,
    public atualizadoEm?: Date,
  ) {}
}
