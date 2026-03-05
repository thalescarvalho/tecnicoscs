export type UserRole = 'GESTOR' | 'TECNICO';

export type TrabalhoStatus = 'PENDENTE' | 'ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: UserRole;
  ativo: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco: string;
  referencia?: string;
  createdAt: string;
}

export interface TrabalhoTecnico {
  id: string;
  clienteId: string;
  tecnicoId: string;
  gestorId: string;
  titulo: string;
  descricao: string;
  tipoServico: string;
  prioridade: Prioridade;
  dataPrevista: string;
  status: TrabalhoStatus;
  startAt?: string;
  startLat?: number;
  startLng?: number;
  startAccuracy?: number;
  endAt?: string;
  endLat?: number;
  endLng?: number;
  observacoesGestor?: string;
  observacoesTecnico?: string;
  createdAt: string;
  updatedAt: string;
  // joined
  cliente?: Cliente;
  tecnico?: User;
}

export interface ItemProduzido {
  id: string;
  trabalhoId: string;
  nomeProduto: string;
  pesoValor: number;
  pesoUnidade: 'kg' | 'g';
  quantidade?: number;
  observacao?: string;
}

export interface Foto {
  id: string;
  trabalhoId: string;
  url: string;
  legenda?: string;
  createdAt: string;
}
