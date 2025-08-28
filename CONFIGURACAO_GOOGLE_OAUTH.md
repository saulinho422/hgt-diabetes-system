# 🔧 Configuração do Google OAuth no Supabase

## ⚠️ **IMPORTANTE: Configuração Necessária**

Para que o login com Google funcione, você precisa configurar o Google OAuth no seu projeto Supabase. Siga estes passos:

## 📋 **Passo a Passo:**

### 1. **Acesse o Dashboard do Supabase**
- Vá para: https://supabase.com/dashboard
- Acesse seu projeto: **rvkocbmfpwjsnnumawqd**

### 2. **Configure o Google OAuth**
- No menu lateral, clique em **"Authentication"**
- Clique na aba **"Providers"**
- Procure por **"Google"** e clique para configurar

### 3. **Configurações Necessárias**

#### **No Google Cloud Console:**
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou use um existente
3. Ative a **Google+ API** e **Google OAuth2 API**
4. Vá em **"Credentials"** → **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Configure:
   - **Application type**: Web application
   - **Name**: HGT System
   - **Authorized redirect URIs**: 
     ```
     https://rvkocbmfpwjsnnumawqd.supabase.co/auth/v1/callback
     ```

#### **No Supabase:**
1. Ative o provider **Google**
2. Cole o **Client ID** do Google Cloud Console
3. Cole o **Client Secret** do Google Cloud Console
4. **Site URL**: `http://localhost:3000` (para desenvolvimento)
5. **Redirect URLs**: `http://localhost:3000` (para desenvolvimento)

### 4. **URLs de Produção (quando fazer deploy)**
- **Site URL**: `https://seu-dominio.netlify.app`
- **Redirect URLs**: `https://seu-dominio.netlify.app`

## 🚀 **Após Configurar:**

1. **Reinicie o servidor de desenvolvimento**:
   ```bash
   npm start
   ```

2. **Teste o login com Google** - deve funcionar corretamente

## 🔍 **Verificação:**
- ✅ Arquivo `.env` criado com as variáveis corretas
- ✅ Supabase configurado com Google OAuth
- ✅ URLs de redirect configuradas
- ✅ Client ID e Secret configurados

## 📞 **Suporte:**
Se continuar com problemas, verifique:
1. Console do navegador para erros
2. Logs do Supabase Dashboard
3. Configurações de OAuth no Google Cloud Console

---
*Configuração atualizada em: ${new Date().toLocaleString()}*
