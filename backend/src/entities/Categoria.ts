export class Categoria {
  constructor(
    public readonly id: number | null,
    public nome: string,
    public descricao: string | null,
    public readonly criadoEm?: Date,
    public atualizadoEm?: Date,
  ) {}
}
