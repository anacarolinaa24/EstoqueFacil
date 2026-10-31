export type TipoMovimentacao = "ENTRADA" | "SAIDA";

export class Movimentacao {
  constructor(
    public readonly id: number | null,
    public produtoId: number,
    public usuarioId: number,
    public tipo: TipoMovimentacao,
    public quantidade: number,
    public observacao: string | null,
    public readonly dataMovimentacao?: Date,
  ) {}
}
