import pool from "../config/database";
import { Produto } from "../entities/Produto";

export class ProdutoRepository {
  async listarTodos(): Promise<Produto[]> {
    const [linhas] = await pool.query(
      `SELECT
                id,
                nome,
                descricao,
                codigo,
                preco,
                quantidade_estoque,
                estoque_minimo,
                categoria_id,
                fornecedor_id,
                criado_em,
                atualizado_em
            FROM produtos`,
    );

    const produtos = linhas as Array<{
      id: number;
      nome: string;
      descricao: string | null;
      codigo: string;
      preco: number;
      quantidade_estoque: number;
      estoque_minimo: number;
      categoria_id: number;
      fornecedor_id: number;
      criado_em: Date;
      atualizado_em: Date;
    }>;

    return produtos.map((produto) => {
      return new Produto(
        produto.id,
        produto.nome,
        produto.descricao,
        produto.codigo,
        Number(produto.preco),
        produto.quantidade_estoque,
        produto.estoque_minimo,
        produto.categoria_id,
        produto.fornecedor_id,
        produto.criado_em,
        produto.atualizado_em,
      );
    });
  }
}
