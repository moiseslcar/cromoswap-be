# 🔒 Socket.io JWT Authentication - Frontend Update Guide

## ⚠️ IMPORTANTE: Mudança de Autenticação

A autenticação do Socket.io foi **atualizada para usar JWT**. O método antigo de passar `userId` via query string não funciona mais.

---

## 🚫 Método Antigo (NÃO USAR MAIS)

```javascript
// ❌ INSEGURO - Não funciona mais
const socket = io('http://localhost:3000', {
  query: { userId: '123' }
});
```

**Problema:** Qualquer cliente podia passar qualquer `userId` e personificar outros usuários.

---

## ✅ Novo Método (Usar JWT Token)

### React Native / Expo

```javascript
import io from 'socket.io-client';

// 1. Obter o token JWT do AsyncStorage ou do contexto de autenticação
const token = await AsyncStorage.getItem('userToken');

// 2. Conectar passando o token via auth
const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

// 3. Escutar eventos
socket.on('connect', () => {
  console.log('✅ Connected to Socket.io');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  // Se o token for inválido, o usuário será desconectado
});

socket.on('receive_message', (message) => {
  console.log('📩 New message:', message);
});

// 4. Enviar mensagem
socket.emit('send_message', {
  receiverId: 456,  // Apenas receiverId
  content: 'Hello!'  // O senderId é extraído do JWT automaticamente
});
```

### React Web

```javascript
import { io } from 'socket.io-client';

function ChatComponent() {
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('token'); // ou useContext(AuthContext)
  
  useEffect(() => {
    // Conectar com JWT token
    const newSocket = io('http://localhost:3000', {
      auth: {
        token: token
      }
    });
    
    newSocket.on('connect', () => {
      console.log('✅ Connected');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });
    
    newSocket.on('receive_message', (message) => {
      // Atualizar UI com nova mensagem
      setMessages(prev => [...prev, message]);
    });
    
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, [token]);
  
  const sendMessage = (receiverId, content) => {
    if (socket) {
      socket.emit('send_message', {
        receiverId,
        content
        // senderId é automático via JWT
      });
    }
  };
  
  return (
    // ... UI
  );
}
```

---

## 📡 Eventos Atualizados

### `send_message` (Cliente → Servidor)

**Antes:**
```javascript
socket.emit('send_message', {
  senderId: 123,    // ❌ Não é mais necessário
  receiverId: 456,
  content: 'Hello!'
});
```

**Agora:**
```javascript
socket.emit('send_message', {
  receiverId: 456,  // ✅ Apenas receiverId
  content: 'Hello!' // O senderId vem do JWT
});
```

### `receive_message` (Servidor → Cliente)

**Não mudou - continua igual:**
```javascript
socket.on('receive_message', (message) => {
  console.log(message);
  // {
  //   id: 1,
  //   senderId: 123,
  //   receiverId: 456,
  //   content: 'Hello!',
  //   seen: false,
  //   createdAt: '2026-02-19T10:00:00.000Z'
  // }
});
```

### `mark_seen` (Cliente → Servidor)

**Não mudou:**
```javascript
socket.emit('mark_seen', {
  messageId: 1
});
```

---

## 🔐 Segurança Melhorada

### Antes
- ❌ Cliente podia passar qualquer `userId`
- ❌ Possível personificação de usuários
- ❌ Sem validação de autenticidade

### Agora
- ✅ Token JWT verificado no servidor
- ✅ UserId extraído do token autenticado
- ✅ Impossível personificar outros usuários
- ✅ Mesma segurança das APIs REST

---

## 🐛 Troubleshooting

### Erro: "Authentication error: No token provided"
**Causa:** Token não foi enviado ou está undefined  
**Solução:** Verifique se o token está sendo passado em `auth.token`

```javascript
// Verificar se o token existe antes de conectar
if (!token) {
  console.error('No token available');
  return;
}

const socket = io('http://localhost:3000', {
  auth: { token }
});
```

### Erro: "Authentication error: Invalid token"
**Causa:** Token expirou ou é inválido  
**Solução:** Fazer login novamente para obter novo token

```javascript
socket.on('connect_error', (error) => {
  if (error.message.includes('Invalid token')) {
    // Redirecionar para login
    navigation.navigate('Login');
  }
});
```

### Mensagens não estão sendo enviadas
**Causa:** Ainda está enviando `senderId` no payload  
**Solução:** Remover `senderId` do evento `send_message`

```javascript
// ❌ Errado
socket.emit('send_message', {
  senderId: myUserId,  // Remover isso
  receiverId: otherId,
  content: 'Hello'
});

// ✅ Correto
socket.emit('send_message', {
  receiverId: otherId,
  content: 'Hello'
});
```

---

## 📋 Checklist de Atualização

Frontend (React Native / Web):
- [ ] Instalar/atualizar `socket.io-client` (versão >= 4.0.0)
- [ ] Obter token JWT do storage/context
- [ ] Passar token via `auth: { token }`
- [ ] Remover `senderId` do payload de `send_message`
- [ ] Adicionar tratamento de erro `connect_error`
- [ ] Testar conexão e envio de mensagens
- [ ] Atualizar lógica de reconexão se necessário

---

## 📚 Exemplo Completo (React Native)

```javascript
import React, { useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen({ route }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const { otherUserId } = route.params;
  
  useEffect(() => {
    let newSocket;
    
    const connectSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) {
          console.error('No token found');
          return;
        }
        
        newSocket = io('http://localhost:3000', {
          auth: { token }
        });
        
        newSocket.on('connect', () => {
          console.log('✅ Socket connected');
        });
        
        newSocket.on('connect_error', (error) => {
          console.error('❌ Socket error:', error.message);
        });
        
        newSocket.on('receive_message', (message) => {
          setMessages(prev => [...prev, message]);
        });
        
        setSocket(newSocket);
      } catch (error) {
        console.error('Error connecting socket:', error);
      }
    };
    
    connectSocket();
    
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);
  
  const sendMessage = (content) => {
    if (socket && content.trim()) {
      socket.emit('send_message', {
        receiverId: otherUserId,
        content: content.trim()
      });
    }
  };
  
  return (
    // ... UI do chat
  );
}
```

---

## 🎯 Benefícios da Mudança

1. **🔒 Segurança:** Impossível personificar outros usuários
2. **🎫 Consistência:** Mesma autenticação usada nas APIs REST
3. **✅ Validação:** Token verificado no servidor antes de aceitar conexão
4. **📊 Rastreamento:** Logs de conexão/desconexão com userId real
5. **🚫 Proteção:** Usuários não autenticados não conseguem conectar

---

**💡 Dica:** Teste a atualização em ambiente de desenvolvimento antes de fazer deploy!
