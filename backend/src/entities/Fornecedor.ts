export class Fornecedor {
  constructor(
    public readonly id: number | null,
    public nome: string,
    public cnpj: string,
    public email: string | null,
    public telefone: string | null,
    public endereco: string | null,
    public readonly criadoEm?: Date,
    public atualizadoEm?: Date,
  ) {}
}
