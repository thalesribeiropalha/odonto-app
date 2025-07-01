# 🚀 Configuração do Railway - Variáveis de Ambiente

## 📋 **PASSO A PASSO:**

### 1. Acesse o Railway Dashboard
- Vá para: https://railway.app/dashboard
- Faça login na sua conta

### 2. Localize seu Projeto
- Procure pelo projeto "odonto-app" ou similar
- Clique no projeto para abrir

### 3. Acesse as Configurações
- Clique na aba **"Variables"** ou **"Environment"**
- Ou clique em **"Settings"** → **"Environment Variables"**

### 4. Adicione as Variáveis de Ambiente

Copie e cole cada variável abaixo:

```
SUPABASE_URL=https://ahnygfwpzuierxsitore.supabase.co
```

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobnlnZndwenVpZXJ4c2l0b3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzA1MzQsImV4cCI6MjA2NjkwNjUzNH0.X4nVjM2rz-DpXmZ8GK6yZKmj3JK-eMkThUt6onMcBmI
```

```
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobnlnZndwenVpZXJ4c2l0b3JlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTMzMDUzNCwiZXhwIjoyMDY2OTA2NTM0fQ.bL2PWsFomxBEGks0Skq6vMf2naTkocpOo5tdjKhPnUs
```

```
JWT_SECRET=odonto-app-jwt-secret-production-2025
```

```
NODE_ENV=production
```

```
PORT=3000
```

### 5. Como Adicionar Cada Variável:

Para cada variável acima:

1. **Clique em "Add Variable"** ou **"+"**
2. **Nome da Variável:** Cole o nome (ex: `SUPABASE_URL`)
3. **Valor:** Cole o valor correspondente
4. **Clique em "Save"** ou **"Add"**

### 6. Verificar Deploy

Após adicionar todas as variáveis:

1. **Railway fará redeploy automático**
2. **Aguarde alguns minutos**
3. **Teste a URL:** `https://seu-projeto.up.railway.app/api/status`

### 7. URLs para Testar:

- **Status:** `/api/status`
- **Teste Supabase:** `/api/test-supabase/connection`
- **Dados:** `/api/test-supabase/data`

## ⚠️ **IMPORTANTE:**

- **Não compartilhe** as chaves do Supabase publicamente
- **JWT_SECRET** deve ser único em produção
- **Railway redeploya automaticamente** após adicionar variáveis

## ✅ **Resultado Esperado:**

Após configurar, sua API deve responder:

```json
{
  "status": "online",
  "service": "Odonto App API",
  "version": "1.0.0",
  "environment": "production",
  "message": "API funcionando perfeitamente! 🦷"
}
```

## 🔧 **Se Precisar de Ajuda:**

1. **Verifique os logs** no Railway Dashboard
2. **Teste localmente** primeiro com as mesmas variáveis
3. **Confirme** que o Supabase está configurado

## 📞 **Suporte:**

Se tiver problemas, verifique:
- Logs do Railway
- Configuração do Supabase
- Conexão com banco de dados
