export default function LoginPanel({ onSubmit, error, loading }) {
  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit({
      email: formData.get("email"),
      password: formData.get("password")
    });
  }

  return (
    <section className="login-shell">
      <div className="brand-copy">
        <p className="eyebrow">Quick Commerce Expansion</p>
        <h1>Black Store Intelligence</h1>
        <p>
          A full-stack dashboard for spotting the best next store launch zone using
          demand, riders, competition, and service coverage.
        </p>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Sign In</p>
        <h2>Open the strategy dashboard</h2>
        <label>
          <span>Email</span>
          <input name="email" type="email" defaultValue="admin@blackstore.demo" required />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" defaultValue="demo123" required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <small>Demo account: admin@blackstore.demo / demo123</small>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </section>
  );
}
