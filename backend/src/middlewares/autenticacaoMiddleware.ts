import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DadosToken {
  sub: string;
  iat?: number;
  exp?: number;
}

export interface RequisicaoAutenticada extends Request {
  usuarioId?: number;
}

export function autenticacaoMiddleware(
  req: RequisicaoAutenticada,
  res: Response,
  next: NextFunction,
): void {
  // 1. Obter o cabeçalho de autorização
  const cabecalhoAutorizacao = req.headers.authorization;

  // 2. Verificar se o token foi enviado
  if (!cabecalhoAutorizacao) {
    res.status(401).json({
      mensagem: "Acesso negado. Token de autenticação não informado.",
    });
    return;
  }

  // 3. Verificar o formato esperado: Bearer + token
  const partes = cabecalhoAutorizacao.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer" || !partes[1]) {
    res.status(401).json({
      mensagem: "Token de autenticação em formato inválido.",
    });
    return;
  }

  const token = partes[1];
  const chaveSecreta = process.env.JWT_SECRET;

  // 4. Verificar se a chave secreta está configurada
  if (!chaveSecreta) {
    console.error("JWT_SECRET não está configurada.");

    res.status(500).json({
      mensagem: "Erro na configuração da autenticação.",
    });
    return;
  }

  try {
    // 5. Validar o token e verificar sua assinatura e validade
    const dadosDecodificados = jwt.verify(token, chaveSecreta) as DadosToken;

    // 6. Verificar se o token possui um identificador de usuário válido
    const usuarioId = Number(dadosDecodificados.sub);

    if (
      !dadosDecodificados.sub ||
      !Number.isSafeInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      res.status(401).json({
        mensagem: "Token inválido.",
      });
      return;
    }

    // 7. Disponibilizar o ID para as próximas etapas da requisição
    req.usuarioId = usuarioId;

    // 8. Permitir que a requisição continue
    next();
  } catch {
    res.status(401).json({
      mensagem: "Token inválido ou expirado.",
    });
  }
}
