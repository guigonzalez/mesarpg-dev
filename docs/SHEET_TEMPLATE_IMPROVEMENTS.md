# Melhorias no Sistema de Templates de Ficha

## Resumo das Correções Implementadas

Este documento descreve as melhorias implementadas no sistema de templates de ficha para garantir que os templates sejam salvos corretamente no banco de dados, incluindo tanto campos preset do sistema quanto campos customizados.

## Problemas Identificados e Soluções

### 1. **Inconsistência na Estrutura de Dados**

**Problema:** O `SheetTemplateEditor` estava removendo os IDs dos campos antes de salvar e depois adicionando IDs vazios, causando problemas na recuperação e edição posterior dos templates.

**Solução:** 
- Preservação de IDs únicos e persistentes para todos os campos
- Implementação de geração automática de IDs únicos para novos campos
- Manutenção da estrutura de dados consistente entre criação e edição

### 2. **Falta de Validação Robusta**

**Problema:** Não havia validação adequada dos tipos de campos, campos obrigatórios e nomes duplicados.

**Solução:**
- Validação de campos obrigatórios antes do salvamento
- Verificação de nomes duplicados de campos
- Validação de tipos de campos suportados
- Verificação de pelo menos um campo no template

### 3. **Problemas de Tipagem**

**Problema:** Inconsistência entre as interfaces `SheetField` no editor e no `database.types.ts`.

**Solução:**
- Padronização das interfaces em ambos os arquivos
- Adição do tipo "select" para campos de lista de opções
- Implementação de metadados estruturados para campos
- Tipagem correta para campos obrigatórios

## Estrutura de Dados Atualizada

### SheetField Interface

```typescript
interface SheetField {
  id: string // UUID único e persistente
  name: string
  type: "text" | "number" | "boolean" | "textarea" | "image" | "select"
  value: string | number | boolean // Valor padrão
  required: boolean
  validation?: {
    min?: number
    max?: number
    options?: string[] // Para campos select
    pattern?: string // Regex para validação
  }
  metadata?: {
    isPreset: boolean // Se é campo do sistema ou customizado
    category?: string // Agrupamento (ex: "Atributos", "Habilidades")
    order: number // Ordem de exibição
  }
}
```

### SheetTemplate Interface

```typescript
interface SheetTemplate {
  id?: string
  name: string
  version: number
  fields: SheetField[]
  metadata: {
    system: string
    createdAt: string
    updatedAt: string
    createdBy?: string
  }
}
```

## Funcionalidades Implementadas

### 1. **Editor de Campos Aprimorado**

- **Drag & Drop:** Reordenação de campos por arrastar e soltar
- **Campos Obrigatórios:** Checkbox para marcar campos como obrigatórios
- **Tipos de Campo:** Suporte a texto, número, boolean, textarea, imagem e select
- **Metadados:** Identificação de campos preset vs customizados
- **Categorização:** Agrupamento de campos por categoria

### 2. **Preview Melhorado**

- **Indicação de Campos Obrigatórios:** Asterisco vermelho (*) para campos obrigatórios
- **Suporte a Todos os Tipos:** Preview adequado para cada tipo de campo
- **Agrupamento Visual:** Campos numéricos agrupados visualmente
- **Responsividade:** Layout adaptável para diferentes tamanhos

### 3. **Validação Robusta**

- **Campos Duplicados:** Verificação de nomes duplicados
- **Campos Vazios:** Validação de pelo menos um campo
- **Campos Obrigatórios:** Aviso se não há campos obrigatórios
- **Estrutura de Dados:** Validação da integridade dos dados

### 4. **Persistência Correta**

- **IDs Únicos:** Preservação de IDs para edição posterior
- **Metadados Completos:** Salvamento de todas as informações necessárias
- **Versionamento:** Suporte a versões de template
- **Timestamps:** Controle de criação e atualização

## Templates Preset Atualizados

### D&D 5e
- Nome do Personagem (obrigatório)
- Avatar (imagem)
- Classe & Nível (obrigatório)
- Atributos: Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma
- Estado: Inspirado

### Vampiro: A Máscara
- Nome (obrigatório)
- Retrato (imagem)
- Clã (obrigatório)
- Geração, Força de Vontade, Humanidade
- Estado: Frenesi

### Sistema Livre
- Nome (obrigatório)
- Imagem
- Conceito

## Melhorias na Interface

### 1. **Editor de Campos**
- Layout em duas colunas com editor e preview
- Campos organizados em cards expansíveis
- Indicadores visuais para campos preset
- Controles intuitivos para reordenação

### 2. **Preview em Tempo Real**
- Atualização automática conforme edição
- Representação fiel da ficha final
- Agrupamento visual de campos relacionados
- Indicação clara de campos obrigatórios

### 3. **Validação Visual**
- Feedback imediato para erros
- Avisos para problemas potenciais
- Confirmação de salvamento bem-sucedido
- Estados de loading durante operações

## Próximos Passos Recomendados

### 1. **Estrutura para Fichas dos Jogadores**
Criar tabela `character_sheets` para armazenar fichas preenchidas:

```sql
CREATE TABLE character_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  character_name VARCHAR(255) NOT NULL,
  sheet_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, player_id)
);
```

### 2. **Sistema de Versionamento**
- Implementar migração automática de fichas antigas
- Permitir atualizações sem quebrar fichas existentes
- Histórico de versões de templates

### 3. **Validações Avançadas**
- Campos calculados e fórmulas
- Regras específicas por sistema (ex: soma de atributos em D&D)
- Validações condicionais entre campos

### 4. **Interface para Jogadores**
- Componente para criação de fichas baseadas no template
- Validação dos dados da ficha contra o template
- Sistema de aprovação pelo mestre (opcional)

## Como os Dados São Salvos no Supabase

### 1. **Templates de Ficha (Tabela `campaigns`)**

Os templates são salvos na coluna `sheet_template` (tipo JSONB) da tabela `campaigns`:

```json
{
  "name": "Template D&D 5e",
  "version": 1,
  "fields": [
    {
      "id": "dnd1",
      "name": "Nome do Personagem",
      "type": "text",
      "value": "",
      "required": true,
      "metadata": {
        "isPreset": true,
        "category": "Básico",
        "order": 1
      }
    },
    {
      "id": "dnd3",
      "name": "Força",
      "type": "number",
      "value": 10,
      "required": false,
      "validation": {
        "min": 1,
        "max": 20
      },
      "metadata": {
        "isPreset": true,
        "category": "Atributos",
        "order": 4
      }
    }
  ],
  "metadata": {
    "system": "D&D 5e",
    "createdAt": "2025-01-07T17:57:45.123Z",
    "updatedAt": "2025-01-07T17:57:45.123Z"
  }
}
```

### 2. **Fichas dos Jogadores (Tabela `character_sheets`)**

As fichas preenchidas pelos jogadores são salvas na nova tabela `character_sheets`:

```sql
CREATE TABLE character_sheets (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  player_id UUID REFERENCES users(id),
  character_name VARCHAR(255) NOT NULL,
  sheet_data JSONB NOT NULL,
  template_version INTEGER DEFAULT 1,
  status character_sheet_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Estrutura do `sheet_data` (JSONB):**

```json
{
  "templateVersion": 1,
  "fields": [
    {
      "id": "dnd1",
      "value": "Aragorn, Filho de Arathorn"
    },
    {
      "id": "dnd3",
      "value": 16
    },
    {
      "id": "dnd4",
      "value": 14
    }
  ]
}
```

### 3. **Vantagens do JSONB no PostgreSQL**

- **Indexação**: Campos específicos podem ser indexados para consultas rápidas
- **Consultas**: Possibilidade de fazer queries nos campos JSON
- **Flexibilidade**: Estrutura pode evoluir sem mudanças no schema
- **Performance**: JSONB é otimizado para consultas e armazenamento

### 4. **Políticas de Segurança (RLS)**

Implementadas políticas de Row Level Security para garantir que:
- Jogadores só veem suas próprias fichas
- Mestres podem ver fichas de suas campanhas
- Apenas jogadores ativos podem criar/editar fichas
- Mestres podem aprovar/rejeitar fichas

## Utilitários de Validação

Criado arquivo `character-sheet-validation.ts` com funções para:

### **Validação de Fichas**
```typescript
validateCharacterSheet(sheetData, template)
// Retorna: { isValid, missingRequiredFields, invalidFields }
```

### **Criação de Fichas Vazias**
```typescript
createEmptyCharacterSheet(template)
// Cria ficha com valores padrão do template
```

### **Migração de Fichas**
```typescript
migrateCharacterSheet(oldSheetData, newTemplate)
// Migra ficha para nova versão do template
```

### **Cálculo de Completude**
```typescript
calculateSheetCompleteness(sheetData, template)
// Retorna porcentagem de preenchimento
```

## Conclusão

As melhorias implementadas garantem que:

1. **Templates são salvos corretamente** com todas as informações necessárias
2. **Campos preset e customizados** são tratados adequadamente
3. **Validação robusta** previne erros de dados
4. **Interface intuitiva** facilita a criação e edição de templates
5. **Estrutura extensível** permite futuras melhorias
6. **Fichas dos jogadores** têm estrutura dedicada e segura
7. **Validação automática** garante integridade dos dados
8. **Migração de versões** permite evolução dos templates

O sistema agora está completamente preparado para ser usado pelos mestres na criação de templates de ficha que serão utilizados pelos jogadores na criação de seus personagens, com salvamento seguro e estruturado no Supabase.
