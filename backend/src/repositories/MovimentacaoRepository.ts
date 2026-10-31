import pool from "../config/database";
import { Movimentacao } from "../entities/Movimentacao";

export class MovimentacaoRepository {
  async listarTodos(): Promise<Movimentacao[]> {
    const [linhas] = await pool.query(
      `SELECT
                id,
                produto_id,
                usuario_id,
                tipo,
                quantidade,
                observacao,
                data_movimentacao
            FROM movimentacoes`,
    );

    const movimentacoes = linhas as Array<{
      id: number;
      produto_id: number;
      usuario_id: number;
      tipo: "ENTRADA" | "SAIDA";
      quantidade: number;
      observacao: string | null;
      data_movimentacao: Date;
    }>;

    return movimentacoes.map((movimentacao) => {
      return new Movimentacao(
        movimentacao.id,
        movimentacao.produto_id,
        movimentacao.usuario_id,
        movimentacao.tipo,
        movimentacao.quantidade,
        movimentacao.observacao,
        movimentacao.data_movimentacao,
      );
    });
  }
}
