"use client";
import { useState } from "react";
import { track } from "../lib/track";

// Email capture for daily flow alerts. Logs an `alert_signup` event (the
// behavioural sink). Actual delivery is wired when a Resend key is configured.
export default function AlertSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | ok | err

  function submit(e) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setState("err");
    track("alert_signup", { email });
    setState("ok");
    setEmail("");
  }

  return (
    <form className="signup" onSubmit={submit}>
      <div className="signup-copy">
        <h3>Daily flow alerts</h3>
        <p>The headline equity &amp; debt numbers in your inbox each evening. Free.</p>
      </div>
      <div className="signup-row">
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
          aria-label="Email address"
        />
        <button type="submit">{state === "ok" ? "Subscribed ✓" : "Subscribe"}</button>
      </div>
      {state === "err" && <span className="signup-err">Please enter a valid email.</span>}
    </form>
  );
}
