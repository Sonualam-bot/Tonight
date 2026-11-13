# Tonight

**One small game for two people, every night, even when they can't be in the same place.**

> **Status:** In progress, started November 2026. This README describes the design and the plan. The checklist at the bottom shows what is built so far.

---

## Why

A lot of couples spend most nights apart: different cities, different homes, parents around. A phone is all they have. They end up on a silent video call or a long chat thread because nothing is made for *doing something together* at the end of the day.

Tonight gives each couple one short two-player game every night. Both partners play at the same time from their own phones, and the best moment is the reveal, when they see each other's answers together.

---

## The flow

1. **Partner A** signs up and gets an invite link or code.
2. **Partner B** opens it and the two are **paired** until either one leaves. No new code every night.
3. Each night, both see **tonight's game** and whether their partner is **online**.
4. Either one taps **Start**. The app shows *"Waiting for your partner..."* until both are in.
5. **Play: "Guess my answer".** Each round, both answer privately. Answers are **revealed only when both have locked in**.
6. **Results:** match score and both answers side by side.
7. *"Next game unlocks tomorrow."*

Pairing happens once because a couple is a permanent pair, not strangers joining a party game. Asking for a code every night would be friction at exactly the moment the app should feel effortless.

---

## Ending a pair

Couples break up, so a pair has to be able to end.

- Either partner can tap **Leave pair**. It doesn't need the other person's agreement.
- The pair is marked `ended` immediately, and any game in progress is cancelled. **Leaving never triggers a reveal.**
- Past games are **hidden from both partners** immediately and **deleted after 30 days**.
- The other partner sees a calm "This pair has ended" screen, including on their next reconnect if they were offline.
- Both return to the "no partner" state and can create or join a new invite. The old code stops working.
- A person can be in **at most one active pair**.

A pair is its own record (`Pair: playerA, playerB, status, createdAt, endedAt`), not a `partnerId` on each user, because the relationship has its own lifecycle and owns its games.

---

## The one thing that must work: reveal when both lock in

In practice, that means:

- Neither partner ever sees the other's answer early. That includes the browser's network tab, not just the UI.
- If one partner locks in and their phone drops, the lock **survives**. On reconnect they land on the right screen.
- If both lock in at the same moment, the reveal happens **exactly once**, for both.
- If one partner leaves mid-round, nothing is revealed, even if they had already locked in.

---

## States the UI must handle

Two players makes this fragile: if one drops, the game stops for both. Network is only one of the ways it goes wrong.

| Kind | What happens at 11pm | What the UI shows |
|---|---|---|
| **Human timing** | A opens the app, B isn't there yet | Partner offline or away, with a clear waiting state instead of a blank screen |
| **Phone lifecycle** | B's screen locks, or B switches apps and the OS kills the connection | Partner "reconnecting...", then B resumes on the right screen |
| **Network** | Wi-Fi drops and the phone switches to mobile data mid-answer | The answer is sent once: not lost, not duplicated |
| **Pace** | A answers in 2 seconds, B takes 40 | A sees "Waiting for your partner to lock in", not a frozen screen |
| **Identity** | The invite code is pasted in the wrong chat, or B opens the game on two devices | "This pair is full", and one active session per person |
| **Leaving** | B taps Leave pair while A is mid-round | A sees "This pair has ended", the round is cancelled, nothing is revealed |

Every row is a loading, empty, error or retry state that has to be designed, not just handled in code.

---

## Architecture

### Server-authoritative state

Clients send **intents**, the server sends back **facts**.

```
Client A                     Server                       Client B
   |  "lock in: answer X"  -->  |                              |
   |                            |  stores X, does NOT send it  |
   |                            |  -- "partner locked in" -->  |
   |                            |  <--  "lock in: answer Y"    |
   |  <-- reveal {X, Y} ------- | ------- reveal {X, Y} -->    |
```

The server owns the game state instead of each browser, for four reasons:

1. **Single source of truth.** Two copies of state drift apart: A's screen could say "both locked in" while B's says "waiting".
2. **It survives disconnects.** When a phone kills the tab, anything held only in that browser is gone. The server still knows who locked in.
3. **The reveal happens once.** When both lock in at the same moment, exactly one place decides "that's both, reveal now".
4. **It withholds answers.** Storing answers on the server isn't enough. The server must not *send* one partner's answer to the other until both are locked in.

### Planned stack

| Layer | Choice | Why |
|---|---|---|
| Client | React + TypeScript (Vite) | Fastest way for me to ship a polished first version |
| Real-time | WebSocket | Two-way, low-latency updates for presence, locks and reveals |
| Server | Node.js + TypeScript | One language across client and server, so message types can be shared |
| Storage | Lightweight database for pairs and game state | Game state must outlive a server restart |
| Mobile | Flutter client | After the web version proves the flow |

---

## Scope

**In the first version**
- Pairing with an invite code
- Leave pair (history hidden, deleted after 30 days)
- Partner presence (online, away, reconnecting)
- One game type, "Guess my answer", with reveal when both lock in
- Reconnect and resume mid-game
- Results screen
- Tests for the game state machine

**Deliberately cut for now**

| Cut | Why |
|---|---|
| Chat, voice notes, GIFs | Couples already have a chat app open. Chat doesn't make Tonight different. |
| Emoji reactions | Nice to have. Nothing depends on them. |
| AI-generated games | The flow must work with a fixed question bank first. |
| Accounts and login | The pair link is enough to prove the flow. |
| Daily unlock time | Comes after people can actually play a game. |
| Take a break (pause a pair) | Leave already covers the dead-end case. Pausing is comfort, not core. |
| Restore history after re-pairing | Needs both partners' consent flow. Comes after Leave works. |

---

## Roadmap

- [ ] Project scaffold (client + server, shared message types)
- [ ] Pairing with an invite code
- [ ] Leave pair, with game cancelled and history hidden
- [ ] Partner presence over WebSocket
- [ ] "Guess my answer" game state machine, with tests
- [ ] Reveal when both lock in, with no early leaks
- [ ] Reconnect and resume mid-game
- [ ] Results screen
- [ ] Deploy and live demo link
- [ ] AI-generated questions from both partners' preferences, with a fixed question bank as fallback
- [ ] Daily unlock and "come back tomorrow"
- [ ] Flutter client
