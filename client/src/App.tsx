import { usePairState } from "./use-pair-state.ts";

/** Root screen. Temporary: shows the raw pair state to prove the connection works. */
export default function App() {
  const pairState = usePairState();

  if (pairState === null) return <p>Connecting...</p>;

  return (
    <main>
      <p>Status: {pairState.status}</p>
      <p>Partner online: {pairState.partnerOnline ? "yes" : "no"}</p>
    </main>
  );
}
