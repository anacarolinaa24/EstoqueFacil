export class Usuario {
  constructor(
    public readonly id: number | null,
    public nome: string,
    public readonly email: string,
    public cpf: string,
    public readonly criadoEm?: Date,
    public atualizadoEm?: Date,
  ) {}
}
