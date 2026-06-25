import { useState } from "react";
import { toast } from "sonner";
import { subscribe } from "@/lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Transmission requires a valid signal address.");
      return;
    }
    setLoading(true);
    try {
      await subscribe(email);
      setDone(true);
      toast.success("Channel opened. Transmissions inbound.");
    } catch (err) {
      toast.error("Signal lost. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="transmissions"
      data-testid="newsletter-section"
      className="relative py-24 md:py-40 border-t border-gold/10"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <div className="overline mb-4">— Channel · §VII</div>
        <h2 className="font-serif text-4xl sm:text-5xl leading-tight text-bone">
          Receive <span className="italic text-gold">Transmissions</span>.
        </h2>
        <p className="mt-6 font-mono text-sm text-bone-dim leading-loose max-w-xl mx-auto">
          A slow newsletter. Field notes, plates, and the occasional warning. We send a
          dispatch when there is something worth burning a candle for — no more than that.
        </p>

        {done ? (
          <div
            data-testid="newsletter-success"
            className="mt-12 mx-auto max-w-md bracket-corners p-8 bg-ink-800/40"
          >
            <div className="overline mb-2 text-gold">Channel Open</div>
            <p className="font-serif text-2xl text-bone">
              Thank you. The next signal will find you.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-12 mx-auto max-w-md">
            <div className="flex border border-gold/40 focus-within:border-gold transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="signal_address@you"
                data-testid="newsletter-input"
                className="flex-1 bg-transparent px-4 py-3 font-mono text-sm text-bone placeholder:text-bone-mute outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="newsletter-submit"
                className="border-l border-gold/40 px-5 py-3 font-mono text-[11px] tracking-[0.28em] uppercase text-gold hover:bg-gold hover:text-ink-900 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending…" : "Subscribe"}
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] tracking-[0.24em] uppercase text-bone-mute">
              We will never sell your signal. Unsubscribe at any candle.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
