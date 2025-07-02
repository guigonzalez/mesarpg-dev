-- Debug: Verificar problema de mestre da campanha
-- Usuário: guiperezgo@gmail.com

-- 1. Verificar dados do usuário
SELECT 
  id as user_id,
  email,
  name,
  created_at
FROM users 
WHERE email = 'guiperezgo@gmail.com';

-- 2. Verificar campanhas onde este usuário é mestre
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.master_id,
  u.email as master_email,
  c.created_at
FROM campaigns c
LEFT JOIN users u ON c.master_id = u.id
WHERE u.email = 'guiperezgo@gmail.com';

-- 3. Verificar todas as campanhas e seus mestres
SELECT 
  c.id as campaign_id,
  c.name as campaign_name,
  c.master_id,
  u.email as master_email,
  u.name as master_name
FROM campaigns c
LEFT JOIN users u ON c.master_id = u.id
ORDER BY c.created_at DESC;

-- 4. Verificar se há discrepância entre IDs
SELECT 
  'User from Auth' as source,
  id,
  email
FROM users 
WHERE email = 'guiperezgo@gmail.com'

UNION ALL

SELECT 
  'Master from Campaigns' as source,
  master_id as id,
  'N/A' as email
FROM campaigns
WHERE master_id IN (
  SELECT id FROM users WHERE email = 'guiperezgo@gmail.com'
);
