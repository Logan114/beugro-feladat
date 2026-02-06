import { useState } from "react";
import { login } from "../auth";
import ForgotPassword from "./ForgotPassword";
interface Props {
  onLogin: (data: { isAgent: boolean }) => void;
}

export default function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] =useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await login(email, password);
    onLogin({ isAgent: Boolean(data?.is_agent) });
  };

  if(showForgot){
    return <ForgotPassword />
  }

  return (
    <div className="Container">
      <h2>Please log in to access your events</h2>
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
      <button type="submit" >login</button>
      <br />
      <button type="submit" style={{backgroundColor :"red"}} onClick={()=>setShowForgot(true)}>Reset Password</button>
      </form>
    </div>
  );
}
