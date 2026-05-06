import { useState } from "react";
import { motion } from "framer-motion";

export default function GetInTouch() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setOk("");
    setErr("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErr("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      // ✅ FormSubmit AJAX endpoint
      const res = await fetch("https://formsubmit.co/ajax/itsmike0909@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: "New message from Research Dost",
          _captcha: "false",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send message");
      }

      setOk("Message sent successfully. We will contact you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (e2) {
      setErr(e2.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <motion.section
    id="contact"
    className="contact-section"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    >
      <h2 className="contact-title">Get In Touch</h2>
      <div className="contact-title-underline" />

      <div className="contact-card">
        <form onSubmit={submit} className="contact-form">
          {err && <div className="ws-alert ws-alert-error">⚠️ {err}</div>}
          {ok && <div className="ws-alert ws-alert-success">✅ {ok}</div>}

          <input
            className="contact-input"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="contact-input"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            className="contact-textarea"
            placeholder="Your Message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button className="contact-btn" disabled={loading} type="submit">
            {loading ? "Sending..." : "Send Message"}
            <span className="contact-btn-icon">✈</span>
          </button>
        </form>
      </div>
    </motion.section>
  );
}