import { useState } from 'react';
import { LoginPage } from '@/app/components/LoginPage';
import { ChatPage } from '@/app/components/ChatPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
  };

  return (
    <div className="size-full">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <ChatPage username={username} onLogout={handleLogout} />
      )}
    </div>
  );
}
