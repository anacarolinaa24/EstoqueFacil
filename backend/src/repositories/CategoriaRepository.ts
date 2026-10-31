import pool from "../config/database";
import { Categoria } from "../entities/Categoria";

export class CategoriaRepository {
  async listarTodos(): Promise<Categoria[]> {
    const [linhas] = await pool.query(
      "SELECT id, nome, descricao, criado_em, atualizado_em FROM categorias",
    );

    const categorias = linhas as Array<{
      id: number;
      nome: string;
      descricao: string | null;
      criado_em: Date;
      atualizado_em: Date;
    }>;

    return categorias.map((categoria) => {
      return new Categoria(
        categoria.id,
        categoria.nome,
        categoria.descricao,
        categoria.criado_em,
        categoria.atualizado_em,
      );
    });
  }
}
