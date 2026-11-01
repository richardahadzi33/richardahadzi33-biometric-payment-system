import { useState, type FormEvent } from "react";

type Customer = {
  id: string;
  name: string;
  balance: number;
};

type TransactionStatus = "completed" | "refunded" | "failed";

type Transaction = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  purpose: string;
  status: TransactionStatus;
  detail?: string;
  createdAt: string;
};

type View = "payment" | "customers" | "activity";
type DemoOutcome = "approved" | "fingerprint" | "network";

const initialCustomers: Customer[] = [
  { id: "c-ama", name: "Ama Mensah", balance: 250 },
  { id: "c-kojo", name: "Kojo Asante", balance: 85 },
  { id: "c-akua", name: "Akua Boateng", balance: 42.5 },
];

const money = (amount: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

const createId = () =>
  `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function App() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [view, setView] = useState<View>("payment");
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomers[0].id);
  const [amount, setAmount] = useState("18.50");
  const [purpose, setPurpose] = useState("Market purchase");
  const [demoOutcome, setDemoOutcome] = useState<DemoOutcome>("approved");
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(
    null,
  );

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );
  const completedTotal = transactions
    .filter((transaction) => transaction.status === "completed")
    .reduce((total, transaction) => total + transaction.amount, 0);

  function recordTransaction(
    customer: Customer,
    transactionAmount: number,
    status: TransactionStatus,
    detail?: string,
  ) {
    const transaction: Transaction = {
      id: createId(),
      customerId: customer.id,
      customerName: customer.name,
      amount: transactionAmount,
      purpose: purpose.trim() || "Payment",
      status,
      detail,
      createdAt: new Date().toLocaleString("en-GH", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };
    setTransactions((current) => [transaction, ...current]);
    return transaction;
  }

  function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const parsedAmount = Number(amount);
    if (!selectedCustomer || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setNotice({ kind: "error", text: "Enter a payment amount greater than GHS 0.00." });
      return;
    }

    if (demoOutcome === "fingerprint") {
      recordTransaction(selectedCustomer, parsedAmount, "failed", "Fingerprint not recognized");
      setNotice({
        kind: "error",
        text: "Fingerprint not recognized. No demo balance was taken.",
      });
      return;
    }

    if (demoOutcome === "network") {
      recordTransaction(selectedCustomer, parsedAmount, "failed", "Connection timed out");
      setNotice({
        kind: "error",
        text: "Connection timed out. Check activity before trying again.",
      });
      return;
    }

    if (parsedAmount > selectedCustomer.balance) {
      recordTransaction(selectedCustomer, parsedAmount, "failed", "Insufficient balance");
      setNotice({
        kind: "error",
        text: "Not enough demo balance. No money was taken.",
      });
      return;
    }

    setCustomers((current) =>
      current.map((customer) =>
        customer.id === selectedCustomer.id
          ? { ...customer, balance: customer.balance - parsedAmount }
          : customer,
      ),
    );
    recordTransaction(selectedCustomer, parsedAmount, "completed");
    setNotice({
      kind: "success",
      text: `Demo payment of ${money(parsedAmount)} approved for ${selectedCustomer.name}.`,
    });
  }

  function handleEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const startingBalance = Number(formData.get("startingBalance"));
    const consent = formData.get("consent") === "on";

    if (!name || !Number.isFinite(startingBalance) || startingBalance < 0 || !consent) {
      setNotice({
        kind: "error",
        text: "Enter a name, a valid demo balance, and confirm permission to enroll this test customer.",
      });
      return;
    }

    const customer: Customer = {
      id: createId(),
      name,
      balance: startingBalance,
    };
    setCustomers((current) => [customer, ...current]);
    setSelectedCustomerId(customer.id);
    setNotice({
      kind: "success",
      text: `${name} was added to this demo. No fingerprint was collected.`,
    });
    setView("payment");
  }

  function handleRefund(transaction: Transaction) {
    if (transaction.status !== "completed") return;

    setTransactions((current) =>
      current.map((item) =>
        item.id === transaction.id ? { ...item, status: "refunded" } : item,
      ),
    );
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === transaction.customerId
          ? { ...customer, balance: customer.balance + transaction.amount }
          : customer,
      ),
    );
    setNotice({
      kind: "success",
      text: `${money(transaction.amount)} was returned to ${transaction.customerName}'s demo balance.`,
    });
  }

  function resetDemo() {
    setCustomers(initialCustomers);
    setTransactions([]);
    setSelectedCustomerId(initialCustomers[0].id);
    setAmount("18.50");
    setPurpose("Market purchase");
    setDemoOutcome("approved");
    setNotice({ kind: "success", text: "Demo reset. Sample customers are ready." });
    setView("payment");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="FieldPay demo home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fieldpay</span>
        </a>
        <div className="topbar-right">
          <span className="demo-pill"><span /> SIMULATION</span>
          <button className="text-button reset-button" onClick={resetDemo} type="button">
            Reset demo
          </button>
          <div className="merchant-avatar" aria-label="Merchant account">M</div>
        </div>
      </header>

      <div className="content">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">MERCHANT TERMINAL <span>·</span> ACCRA, GHANA</p>
            <h1>Good afternoon, Kofi</h1>
            <p className="subheading">A simple way to explore a biometric payment journey.</p>
          </div>
          <div className="merchant-status"><span /> Demo merchant active</div>
        </section>

        <section className="simulation-banner" aria-label="Important demo notice">
          <span className="banner-icon" aria-hidden="true">i</span>
          <p>
            <strong>Safe to explore:</strong> this is a simulation. It does not scan fingerprints,
            contact a bank, or move real money.
          </p>
        </section>

        {notice && (
          <div
            className={`notice notice-${notice.kind}`}
            role={notice.kind === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <span aria-hidden="true">{notice.kind === "success" ? "✓" : "!"}</span>
            {notice.text}
            <button
              className="notice-dismiss"
              type="button"
              aria-label="Dismiss message"
              onClick={() => setNotice(null)}
            >
              ×
            </button>
          </div>
        )}

        <section className="stats-grid" aria-label="Demo summary">
          <article className="stat-card">
            <span className="stat-label">TEST CUSTOMERS</span>
            <strong>{customers.length}</strong>
            <span className="stat-note">In this demo</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">SUCCESSFUL PAYMENTS</span>
            <strong>{transactions.filter((item) => item.status === "completed" || item.status === "refunded").length}</strong>
            <span className="stat-note">Including refunds</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">CURRENT DEMO SALES</span>
            <strong>{money(completedTotal)}</strong>
            <span className="stat-note">Refunds removed from total</span>
          </article>
        </section>

        <nav className="tabs" aria-label="Merchant tools">
          <button
            className={view === "payment" ? "tab active" : "tab"}
            onClick={() => { setView("payment"); setNotice(null); }}
            type="button"
          >
            Take payment
          </button>
          <button
            className={view === "customers" ? "tab active" : "tab"}
            onClick={() => { setView("customers"); setNotice(null); }}
            type="button"
          >
            Customers <span className="tab-count">{customers.length}</span>
          </button>
          <button
            className={view === "activity" ? "tab active" : "tab"}
            onClick={() => { setView("activity"); setNotice(null); }}
            type="button"
          >
            Activity <span className="tab-count">{transactions.length}</span>
          </button>
        </nav>

        {view === "payment" && (
          <section className="main-grid">
            <article className="panel payment-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">NEW TRANSACTION</p>
                  <h2>Take a payment</h2>
                </div>
                <span className="step-label">01 <span>/</span> 02</span>
              </div>
              <form onSubmit={handlePayment}>
                <label className="field-label" htmlFor="customer">Customer</label>
                <div className="select-wrap">
                  <select
                    id="customer"
                    value={selectedCustomerId}
                    onChange={(event) => setSelectedCustomerId(event.target.value)}
                  >
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>

                {selectedCustomer && (
                  <div className="balance-preview">
                    <span className="customer-avatar">{selectedCustomer.name.charAt(0).toUpperCase()}</span>
                    <span>
                      <strong>{selectedCustomer.name}</strong>
                      <small>Available demo balance</small>
                    </span>
                    <b>{money(selectedCustomer.balance)}</b>
                  </div>
                )}

                <div className="form-row">
                  <div className="amount-field">
                    <label className="field-label" htmlFor="amount">Amount</label>
                    <div className="amount-input">
                      <span>GHS</span>
                      <input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="purpose-field">
                    <label className="field-label" htmlFor="purpose">What for?</label>
                    <input
                      id="purpose"
                      type="text"
                      value={purpose}
                      maxLength={60}
                      onChange={(event) => setPurpose(event.target.value)}
                    />
                  </div>
                </div>

                <label className="field-label" htmlFor="demoOutcome">Try a demo result</label>
                <div className="select-wrap">
                  <select
                    id="demoOutcome"
                    value={demoOutcome}
                    onChange={(event) => setDemoOutcome(event.target.value as DemoOutcome)}
                  >
                    <option value="approved">Approve payment</option>
                    <option value="fingerprint">Fingerprint not recognized</option>
                    <option value="network">Connection timeout</option>
                  </select>
                </div>
                <p className="field-help">Try a failure to see what the merchant would be told.</p>

                <button className="primary-button pay-button" type="submit">
                  <span className="fingerprint-mark" aria-hidden="true">◎</span>
                  Simulate fingerprint payment
                  <span className="button-arrow" aria-hidden="true">→</span>
                </button>
                <p className="button-footnote">Fingerprint matching is simulated. No scan takes place.</p>
              </form>
            </article>

            <aside className="side-column">
              <article className="panel journey-panel">
                <p className="eyebrow">HOW THE DEMO WORKS</p>
                <h2>A payment in three steps</h2>
                <ol className="journey-list">
                  <li><span>1</span><div><strong>Choose a customer</strong><small>Use a sample or add a test customer.</small></div></li>
                  <li><span>2</span><div><strong>Enter the amount</strong><small>Demo balances change when approved.</small></div></li>
                  <li><span>3</span><div><strong>Simulate the scan</strong><small>See success or a helpful failure message.</small></div></li>
                </ol>
              </article>
              <article className="help-card">
                <span className="help-icon" aria-hidden="true">?</span>
                <div>
                  <strong>Need a new test customer?</strong>
                  <p>Add one without entering a real fingerprint.</p>
                  <button
                    className="text-button add-customer-link"
                    type="button"
                    onClick={() => { setView("customers"); setNotice(null); }}
                  >
                    Add customer <span aria-hidden="true">→</span>
                  </button>
                </div>
              </article>
            </aside>
          </section>
        )}

        {view === "customers" && (
          <section className="main-grid customers-grid">
            <article className="panel">
              <div className="panel-heading">
                <div><p className="eyebrow">TEST ACCOUNTS</p><h2>Customers</h2></div>
                <span className="step-label">{customers.length} total</span>
              </div>
              <div className="customer-list">
                {customers.map((customer) => (
                  <div className="customer-row" key={customer.id}>
                    <span className="customer-avatar">{customer.name.charAt(0).toUpperCase()}</span>
                    <div className="customer-details">
                      <strong>{customer.name}</strong>
                      <small>Test account · no biometric stored</small>
                    </div>
                    <b>{money(customer.balance)}</b>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel enrollment-panel">
              <p className="eyebrow">ADD TO THE DEMO</p>
              <h2>Enroll a test customer</h2>
              <p className="panel-intro">This creates a name and a pretend balance only. It does not enroll a fingerprint.</p>
              <form onSubmit={handleEnrollment}>
                <label className="field-label" htmlFor="name">Customer name</label>
                <input id="name" name="name" type="text" autoComplete="off" maxLength={60} required />
                <label className="field-label" htmlFor="startingBalance">Starting demo balance</label>
                <div className="amount-input">
                  <span>GHS</span>
                  <input id="startingBalance" name="startingBalance" type="number" min="0" step="0.01" defaultValue="100.00" required />
                </div>
                <label className="consent-check">
                  <input name="consent" type="checkbox" required />
                  <span>I have permission to add this test customer to the demo.</span>
                </label>
                <button className="primary-button" type="submit">Add test customer</button>
              </form>
            </article>
          </section>
        )}

        {view === "activity" && (
          <section className="panel activity-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">MERCHANT RECORD</p><h2>Recent activity</h2></div>
              <span className="step-label">{transactions.length} items</span>
            </div>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">↗</span>
                <h3>No activity yet</h3>
                <p>Your demo payments, failures, and refunds will show here.</p>
                <button className="text-button" type="button" onClick={() => setView("payment")}>
                  Make a demo payment <span aria-hidden="true">→</span>
                </button>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Customer</th><th>Purpose</th><th>When</th><th>Amount</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td><strong>{transaction.customerName}</strong>{transaction.detail && <small>{transaction.detail}</small>}</td>
                        <td>{transaction.purpose}</td>
                        <td>{transaction.createdAt}</td>
                        <td><strong>{money(transaction.amount)}</strong></td>
                        <td><span className={`status-tag status-${transaction.status}`}>{transaction.status}</span></td>
                        <td>
                          {transaction.status === "completed" && (
                            <button className="refund-button" type="button" onClick={() => handleRefund(transaction)}>
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          <span>FieldPay demo <span>·</span> Built for learning</span>
          <span>Ghana cedi <b>GHS</b></span>
        </footer>
      </div>
    </main>
  );
}

export default App;
