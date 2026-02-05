import { useState } from "react";
import { login } from "../auth";
import ForgotPassword from "./ForgotPassword";
interface Props {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] =useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    onLogin();
  };

  if(showForgot){
    return <ForgotPassword />
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        id="email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        id="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" style={{color:"276CF5"}} >loaagin</button>
      <button type="submit" onClick={()=>setShowForgot(true)}>Reset Password</button>
    </form>
  );
}
