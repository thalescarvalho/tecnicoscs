import { User, Cliente, TrabalhoTecnico, ItemProduzido, Foto } from '@/types';

export const mockUsers: User[] = [
  { id: '1', nome: 'Ana Silva', email: 'ana@padaria.com', telefone: '(11) 99999-0001', role: 'GESTOR', ativo: true, createdAt: '2025-01-01' },
  { id: '2', nome: 'Carlos Oliveira', email: 'carlos@padaria.com', telefone: '(11) 99999-0002', role: 'TECNICO', ativo: true, createdAt: '2025-01-05' },
  { id: '3', nome: 'Maria Santos', email: 'maria@padaria.com', telefone: '(11) 99999-0003', role: 'TECNICO', ativo: true, createdAt: '2025-01-10' },
  { id: '4', nome: 'Pedro Costa', email: 'pedro@padaria.com', telefone: '(11) 99999-0004', role: 'TECNICO', ativo: false, createdAt: '2025-02-01' },
];

export const mockClientes: Cliente[] = [
  { id: 'c1', nome: 'Padaria Pão Quente', telefone: '(11) 3333-1111', email: 'contato@paoquente.com', endereco: 'Rua das Flores, 123 - Centro', referencia: 'Próx. à praça central', createdAt: '2025-01-01' },
  { id: 'c2', nome: 'Confeitaria Doce Mel', telefone: '(11) 3333-2222', endereco: 'Av. Brasil, 456 - Jardim América', createdAt: '2025-01-15' },
  { id: 'c3', nome: 'Restaurante Sabor & Arte', telefone: '(11) 3333-3333', email: 'compras@saborarte.com', endereco: 'Rua Augusta, 789 - Consolação', referencia: 'Edifício comercial, 2º andar', createdAt: '2025-02-01' },
];

export const mockTrabalhos: TrabalhoTecnico[] = [
  {
    id: 't1', clienteId: 'c1', tecnicoId: '2', gestorId: '1',
    titulo: 'Manutenção de forno industrial',
    descricao: 'Revisão completa do forno principal. Verificar termostato e resistências.',
    tipoServico: 'Manutenção', prioridade: 'ALTA', dataPrevista: '2026-03-05',
    status: 'ANDAMENTO',
    startAt: '2026-03-05T08:30:00', startLat: -23.5505, startLng: -46.6333, startAccuracy: 10,
    createdAt: '2026-03-03', updatedAt: '2026-03-05',
    cliente: mockClientes[0], tecnico: mockUsers[1],
  },
  {
    id: 't2', clienteId: 'c2', tecnicoId: '3', gestorId: '1',
    titulo: 'Treinamento de equipe - confeitaria',
    descricao: 'Treinamento para nova linha de bolos decorados. 4 colaboradores.',
    tipoServico: 'Treinamento', prioridade: 'MEDIA', dataPrevista: '2026-03-06',
    status: 'PENDENTE',
    createdAt: '2026-03-04', updatedAt: '2026-03-04',
    cliente: mockClientes[1], tecnico: mockUsers[2],
  },
  {
    id: 't3', clienteId: 'c3', tecnicoId: '2', gestorId: '1',
    titulo: 'Produção sob demanda - evento',
    descricao: 'Produção de 200 pães artesanais e 50 bolos para evento corporativo.',
    tipoServico: 'Produção sob demanda', prioridade: 'URGENTE', dataPrevista: '2026-03-07',
    status: 'PENDENTE',
    createdAt: '2026-03-04', updatedAt: '2026-03-04',
    cliente: mockClientes[2], tecnico: mockUsers[1],
  },
  {
    id: 't4', clienteId: 'c1', tecnicoId: '3', gestorId: '1',
    titulo: 'Instalação de masseira',
    descricao: 'Instalação e calibração de masseira industrial nova.',
    tipoServico: 'Instalação', prioridade: 'MEDIA', dataPrevista: '2026-03-02',
    status: 'CONCLUIDO',
    startAt: '2026-03-02T09:00:00', startLat: -23.5505, startLng: -46.6333,
    endAt: '2026-03-02T14:30:00', endLat: -23.5505, endLng: -46.6333,
    createdAt: '2026-02-28', updatedAt: '2026-03-02',
    cliente: mockClientes[0], tecnico: mockUsers[2],
  },
];

export const mockItens: ItemProduzido[] = [
  { id: 'i1', trabalhoId: 't4', nomeProduto: 'Pão francês', pesoValor: 15, pesoUnidade: 'kg', quantidade: 300 },
  { id: 'i2', trabalhoId: 't4', nomeProduto: 'Bolo de chocolate', pesoValor: 5, pesoUnidade: 'kg', quantidade: 10 },
  { id: 'i3', trabalhoId: 't4', nomeProduto: 'Croissant', pesoValor: 3, pesoUnidade: 'kg', quantidade: 60 },
];

export const mockFotos: Foto[] = [
  { id: 'f1', trabalhoId: 't4', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', legenda: 'Pães prontos', createdAt: '2026-03-02' },
  { id: 'f2', trabalhoId: 't4', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', legenda: 'Bolos finalizados', createdAt: '2026-03-02' },
];
