import pool from "../config/database";
import { Fornecedor } from "../entities/Fornecedor";

export class FornecedorRepository {
  async listarTodos(): Promise<Fornecedor[]> {
    const [linhas] = await pool.query(
      `SELECT
                id,
                nome,
                cnpj,
                email,
                telefone,
                endereco,
                criado_em,
                atualizado_em
            FROM fornecedores`,
    );

    const fornecedores = linhas as Array<{
      id: number;
      nome: string;
      cnpj: string;
      email: string | null;
      telefone: string | null;
      endereco: string | null;
      criado_em: Date;
      atualizado_em: Date;
    }>;

    return fornecedores.map((fornecedor) => {
      return new Fornecedor(
        fornecedor.id,
        fornecedor.nome,
        fornecedor.cnpj,
        fornecedor.email,
        fornecedor.telefone,
        fornecedor.endereco,
        fornecedor.criado_em,
        fornecedor.atualizado_em,
      );
    });
  }
}
