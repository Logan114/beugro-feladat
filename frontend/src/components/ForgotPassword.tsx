import API from "../api";
import { type FormEvent, useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      await API.post("/resetpassword", { email });
      setStatus(`Reset link sent to ${email}`);
    } catch (error: any) {
      console.log(error.response?.data);
      setStatus(JSON.stringify(error.response?.data));
    }

  };

  return (
    <form onSubmit={submit}>
      <h1>Forgot password?</h1>
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Your registered email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
